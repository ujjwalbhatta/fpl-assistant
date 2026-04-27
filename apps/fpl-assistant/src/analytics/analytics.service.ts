import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

const positionMap: Record<number, string> = { 1: 'GK', 2: 'DEF', 3: 'MID', 4: 'FWD' };

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getPlayerTrends() {
    const currentGw = await this.prisma.gameweek.findFirst({ where: { isCurrent: true } });
    if (!currentGw) return [];

    const trends = await this.prisma.playerTrend.findMany({
      where: { gameweek: currentGw.id },
      include: { player: { include: { team: true } } },
      orderBy: { rollingAvgPts: 'desc' },
      take: 30,
    });

    return trends.map((t) => ({
      id: t.player.id,
      webName: t.player.webName,
      position: positionMap[t.player.position],
      team: t.player.team.shortName,
      nowCost: t.player.nowCost / 10,
      rollingAvgPts: t.rollingAvgPts,
      formScore: t.formScore,
      valueIndex: t.valueIndex,
      ownershipPct: t.ownershipPct,
      priceRiseCount: t.priceRiseCount,
      isDgwNext: t.isDgwNext,
      isBgwNext: t.isBgwNext,
      dcAvgPerGame: t.dcAvgPerGame,
      chanceOfPlayingNextRound: t.player.chanceOfPlayingNextRound,
      news: t.player.news,
    }));
  }

  async getFixtureDifficulty() {
    const currentGw = await this.prisma.gameweek.findFirst({ where: { isCurrent: true } });
    if (!currentGw) return [];

    const nextGwId = currentGw.id + 1;

    // get fixtures for next 3 GWs
    const fixtures = await this.prisma.fixture.findMany({
      where: { gameweek: { gte: nextGwId, lte: nextGwId + 2 } },
      include: {
        homeTeam: true,
        awayTeam: true,
      },
    });

    // compute avg difficulty per team over next 3 GWs
    const teamDifficulty = new Map<number, { name: string; shortName: string; totalDiff: number; games: number; hasDgw: boolean }>();

    for (const f of fixtures) {
      const home = teamDifficulty.get(f.homeTeamId) ?? { name: f.homeTeam.name, shortName: f.homeTeam.shortName, totalDiff: 0, games: 0, hasDgw: false };
      const away = teamDifficulty.get(f.awayTeamId) ?? { name: f.awayTeam.name, shortName: f.awayTeam.shortName, totalDiff: 0, games: 0, hasDgw: false };

      home.totalDiff += f.homeTeamDifficulty;
      home.games += 1;
      away.totalDiff += f.awayTeamDifficulty;
      away.games += 1;

      teamDifficulty.set(f.homeTeamId, home);
      teamDifficulty.set(f.awayTeamId, away);
    }

    // mark DGW teams
    const dgwStatuses = await this.prisma.teamGameweekStatus.findMany({
      where: { gameweek: { gte: nextGwId, lte: nextGwId + 2 }, fixtureCount: 2 },
    });
    for (const s of dgwStatuses) {
      const t = teamDifficulty.get(s.teamId);
      if (t) { t.hasDgw = true; teamDifficulty.set(s.teamId, t); }
    }

    return Array.from(teamDifficulty.entries())
      .map(([teamId, t]) => ({
        teamId,
        name: t.name,
        shortName: t.shortName,
        avgDifficulty: Math.round((t.totalDiff / t.games) * 10) / 10,
        games: t.games,
        hasDgw: t.hasDgw,
      }))
      .sort((a, b) => a.avgDifficulty - b.avgDifficulty); // easiest first
  }
}
