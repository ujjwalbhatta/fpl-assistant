/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import axios from 'axios';
import { KafkaProducerService } from './kafka.producer.service';

const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

function mapStatus(status: string) {
  const map: Record<
    string,
    'AVAILABLE' | 'DOUBTFUL' | 'INJURED' | 'SUSPENDED' | 'UNAVAILABLE'
  > = {
    a: 'AVAILABLE',
    d: 'DOUBTFUL',
    i: 'INJURED',
    s: 'SUSPENDED',
    u: 'UNAVAILABLE',
  };
  return map[status] ?? 'UNAVAILABLE';
}
const FPL_FIXTURES_URL = 'https://fantasy.premierleague.com/api/fixtures/';
const FPL_LIVE_URL = (gw: number) =>
  `https://fantasy.premierleague.com/api/event/${gw}/live/`;

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private prisma: PrismaService,
    private kafkaProducer: KafkaProducerService,
  ) {}

  @Cron('0 * * * *')
  async pollFplApi() {
    this.logger.log('Polling FPL API...');
    const { data } = await axios.get(FPL_URL);

    const currentGw = data.events.find((e: any) => e.is_current);
    if (currentGw) {
      await this.syncFixtures(currentGw.id);
      await this.syncCurrentGwStats(currentGw.id);
    }

    for (const p of data.elements) {
      const dbPlayer = await this.prisma.player.findUnique({
        where: { id: p.id },
      });

      if (!dbPlayer) continue;

      // always sync all stats from FPL API
      await this.prisma.player.update({
        where: { id: p.id },
        data: {
          nowCost: p.now_cost,
          form: parseFloat(p.form) || 0,
          totalPoints: p.total_points,
          pointsPerGame: parseFloat(p.points_per_game) || 0,
          selectedByPercent: parseFloat(p.selected_by_percent) || 0,
          transfersInEvent: p.transfers_in_event,
          status: mapStatus(p.status),
          chanceOfPlayingNextRound: p.chance_of_playing_next_round,
          news: p.news || null,
          goalsScored: p.goals_scored,
          assists: p.assists,
          cleanSheets: p.clean_sheets,
          ictIndex: parseFloat(p.ict_index) || 0,
          expectedGIPer90: parseFloat(p.expected_goal_involvements_per_90) || 0,
          penaltiesOrder: p.penalties_order,
        },
      });

      // detect price change → write history + publish to Kafka
      if (dbPlayer.nowCost !== p.now_cost) {
        await this.prisma.priceHistory.create({
          data: {
            playerId: p.id,
            oldCost: dbPlayer.nowCost,
            newCost: p.now_cost,
          },
        });

        this.logger.log(
          `Price change: player ${p.id} ${dbPlayer.nowCost} → ${p.now_cost}`,
        );

        await this.kafkaProducer.publish('fpl.price-change', {
          playerId: p.id,
          oldCost: dbPlayer.nowCost,
          newCost: p.now_cost,
        });
      }
    }
  }

  private async syncFixtures(currentGwId: number) {
    const { data: fixtures } = await axios.get(FPL_FIXTURES_URL);

    for (const f of fixtures) {
      if (!f.event) continue;

      await this.prisma.fixture.upsert({
        where: { id: f.id },
        update: {
          gameweek: f.event,
          homeTeamId: f.team_h,
          awayTeamId: f.team_a,
          homeTeamDifficulty: f.team_h_difficulty,
          awayTeamDifficulty: f.team_a_difficulty,
          finished: f.finished,
        },
        create: {
          id: f.id,
          gameweek: f.event,
          homeTeamId: f.team_h,
          awayTeamId: f.team_a,
          homeTeamDifficulty: f.team_h_difficulty,
          awayTeamDifficulty: f.team_a_difficulty,
          finished: f.finished,
        },
      });
    }

    // derive TeamGameweekStatus from fixture counts
    const allFixtures = await this.prisma.fixture.findMany({
      where: { gameweek: { gte: currentGwId } },
    });

    const teamGwMap = new Map<string, number>();
    for (const f of allFixtures) {
      const hKey = `${f.homeTeamId}-${f.gameweek}`;
      const aKey = `${f.awayTeamId}-${f.gameweek}`;
      teamGwMap.set(hKey, (teamGwMap.get(hKey) ?? 0) + 1);
      teamGwMap.set(aKey, (teamGwMap.get(aKey) ?? 0) + 1);
    }

    for (const [key, count] of teamGwMap.entries()) {
      const [teamId, gameweek] = key.split('-').map(Number);
      const status = count === 2 ? 'DOUBLE' : count === 0 ? 'BLANK' : 'SINGLE';
      await this.prisma.teamGameweekStatus.upsert({
        where: { teamId_gameweek: { teamId, gameweek } },
        update: { fixtureCount: count, status },
        create: { teamId, gameweek, fixtureCount: count, status },
      });
    }

    this.logger.log(`Fixtures synced, TeamGameweekStatus updated`);
  }

  private async syncCurrentGwStats(gwId: number) {
    const { data } = await axios.get(FPL_LIVE_URL(gwId));

    const knownIds = new Set(
      (await this.prisma.player.findMany({ select: { id: true } })).map(
        (p) => p.id,
      ),
    );

    for (const el of data.elements) {
      if (!knownIds.has(el.id)) continue;
      const s = el.stats;
      await this.prisma.playerGameweekStat.upsert({
        where: { playerId_gameweek: { playerId: el.id, gameweek: gwId } },
        update: {
          minutes: s.minutes,
          totalPoints: s.total_points,
          cbit: s.clearances_blocks_interceptions + (s.tackles ?? 0),
          cbirt:
            s.clearances_blocks_interceptions +
            (s.tackles ?? 0) +
            (s.recoveries ?? 0),
          dcPoints: s.defensive_contribution ?? 0,
        },
        create: {
          playerId: el.id,
          gameweek: gwId,
          minutes: s.minutes,
          totalPoints: s.total_points,
          cbit: s.clearances_blocks_interceptions + (s.tackles ?? 0),
          cbirt:
            s.clearances_blocks_interceptions +
            (s.tackles ?? 0) +
            (s.recoveries ?? 0),
          dcPoints: s.defensive_contribution ?? 0,
        },
      });
    }

    this.logger.log(`GW${gwId} player stats synced`);
  }
}
