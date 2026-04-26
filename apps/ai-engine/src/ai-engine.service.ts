/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from './prisma.service';

@Injectable()
export class AiEngineService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
  ) {}

  async getTransferAdvice(teamId: number, gameweek: number) {
    // 1. Call FPL API to get squad + bank + free transfers in parallel
    const [picksRes] = await Promise.all([
      firstValueFrom(
        this.http.get<any>(
          `${process.env.FPL_API_BASE}/entry/${teamId}/event/${gameweek}/picks/`,
        ),
      ),
    ]);

    const data = picksRes.data;
    const playerIds: number[] = data.picks.map((p: any) => p.element);
    const bank: number = data.entry_history.bank / 10;
    const eventTransfers: number = data.entry_history.event_transfers ?? 0;
    const freeTransfers: number = eventTransfers === 0 ? 2 : 1;

    // 2. Look up squad players in DB for stats
    const squadPlayers = await this.prisma.player.findMany({
      where: { id: { in: playerIds } },
      include: { team: true },
    });

    // 3. Get top picks from DB
    const allAvailable = await this.prisma.player.findMany({
      where: { status: 'AVAILABLE' },
      include: { team: true },
    });

    const topPicks = allAvailable
      .map((p) => ({
        ...p,
        returningFromInjury:
          p.news !== null && p.chanceOfPlayingNextRound === 100,
        score: p.form + p.pointsPerGame,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 30);

    const injuredPlayers = squadPlayers.filter(
      (p) =>
        p.chanceOfPlayingNextRound !== null && p.chanceOfPlayingNextRound < 75,
    );

    // 4. Build transfer options per squad player — budget enforced in code
    const positionMap: Record<number, string> = {
      1: 'GK',
      2: 'DEF',
      3: 'MID',
      4: 'FWD',
    };
    const squadIdSet = new Set(squadPlayers.map((p) => p.id));

    // find top totalPoints player per position — these are untouchable
    const topPlayerByPosition: Record<number, number> = {};
    for (const p of squadPlayers) {
      if (
        !topPlayerByPosition[p.position] ||
        p.totalPoints >
          squadPlayers.find((s) => s.id === topPlayerByPosition[p.position])!
            .totalPoints
      ) {
        topPlayerByPosition[p.position] = p.id;
      }
    }

    const transferOptions = squadPlayers
      .map((sp) => {
        const isUntouchable = topPlayerByPosition[sp.position] === sp.id;
        if (isUntouchable) {
          return `${positionMap[sp.position]} | ${sp.webName} (${sp.team.shortName}) £${sp.nowCost / 10}m | form: ${sp.form} | PPG: ${sp.pointsPerGame} | totalPoints: ${sp.totalPoints} — KEEP (top performer in position)`;
        }

        const maxSpend = sp.nowCost / 10 + bank;
        const options = topPicks
          .filter(
            (c) =>
              !squadIdSet.has(c.id) &&
              c.position === sp.position &&
              c.nowCost / 10 <= maxSpend,
          )
          .slice(0, 5)
          .map(
            (c) =>
              `${c.webName} (${c.team.shortName}) £${c.nowCost / 10}m | form: ${c.form} | PPG: ${c.pointsPerGame}`,
          );

        return `${positionMap[sp.position]} | ${sp.webName} (${sp.team.shortName}) £${sp.nowCost / 10}m | form: ${sp.form} | PPG: ${sp.pointsPerGame} | totalPoints: ${sp.totalPoints}\n  Affordable replacements: ${options.length ? options.join(' || ') : 'none'}`;
      })
      .join('\n\n');

    const injurySummary =
      injuredPlayers.length > 0
        ? `Injured/doubtful: ${injuredPlayers.map((p) => `${p.webName} (${p.chanceOfPlayingNextRound}% chance)`).join(', ')}`
        : 'No injured players.';

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Groq = require('groq-sdk');
    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const prompt = `You are an FPL transfer advisor.

    Free transfers available: ${freeTransfers}
    ${injurySummary}

    Each squad player is listed with their affordable replacements (already filtered by budget and position).
    You MUST only pick transfers from the listed replacements — do not suggest anyone not listed.

    ${transferOptions}

    Rules:
    - Only pick from the listed affordable replacements — never suggest a player marked KEEP
    - You have ${freeTransfers} free transfer(s) — use all of them if there are worthwhile options
    - Do not transfer out any player marked KEEP
    - If no free transfers remain but a player is injured, recommend a -4pt hit only if gain clearly outweighs cost

    Respond in this exact JSON format with no extra text:
    {
      "transfers": [
        { "transferOut": { "name": "player name", "reason": "why" }, "transferIn": { "name": "player name", "reason": "why" }, "isFree": true }
      ],
      "reasoning": "overall summary"
    }`;

    const message = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    // 5. Parse response and compute accurate budget in code
    const result = JSON.parse(message.choices[0].message.content);

    let remainingBudget = bank;
    for (const t of result.transfers) {
      const outPlayer = squadPlayers.find(
        (p) => p.webName === t.transferOut.name,
      );
      const inPlayer = topPicks.find((p) => p.webName === t.transferIn.name);
      if (outPlayer && inPlayer) {
        remainingBudget =
          remainingBudget + outPlayer.nowCost / 10 - inPlayer.nowCost / 10;
      }
    }
    result.budgetAfterTransfers = Math.round(remainingBudget * 10) / 10;

    return result;
  }
}
