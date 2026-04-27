import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';

@Injectable()
export class EtlService {
  private readonly logger = new Logger(EtlService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron('* 2 * * *')
  async runEtl() {
    this.logger.log('ETL job started');

    const currentGw = await this.prisma.gameweek.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });

    if (!currentGw) {
      this.logger.warn('No current gameweek found');
      return;
    }

    const players = await this.prisma.player.findMany({
      include: { priceChanges: true },
    });

    for (const player of players) {
      const last5Stats = await this.prisma.playerGameweekStat.findMany({
        where: { playerId: player.id },
        orderBy: { gameweek: 'desc' },
        take: 5,
      });

      const rollingAvgPts = last5Stats.length
        ? last5Stats.reduce((sum, s) => sum + s.totalPoints, 0) /
          last5Stats.length
        : 0;

      const dcStats = last5Stats.filter((s) => s.cbit > 0 || s.cbirt > 0);
      const dcAvgPerGame = dcStats.length
        ? dcStats.reduce((sum, s) => sum + s.cbit + s.cbirt, 0) / dcStats.length
        : 0;
      const dcHitRatePct = last5Stats.length
        ? (last5Stats.filter((s) => s.dcPoints > 0).length /
            last5Stats.length) *
          100
        : 0;

      const teamGwStatus = await this.prisma.teamGameweekStatus.findFirst({
        where: { teamId: player.teamId, gameweek: currentGw.id },
      });

      await this.prisma.playerTrend.upsert({
        where: {
          playerId_gameweek: { playerId: player.id, gameweek: currentGw.id },
        },
        update: {
          rollingAvgPts,
          formScore: player.form,
          valueIndex:
            player.nowCost > 0 ? player.form / (player.nowCost / 10) : 0,
          ownershipPct: player.selectedByPercent,
          priceRiseCount: player.priceChanges.length,
          fixtureScore: player.fixtureScore,
          dcAvgPerGame,
          dcHitRatePct,
          isDgwNext: teamGwStatus?.fixtureCount === 2,
          isBgwNext: teamGwStatus?.fixtureCount === 0,
        },
        create: {
          playerId: player.id,
          gameweek: currentGw.id,
          rollingAvgPts,
          formScore: player.form,
          valueIndex:
            player.nowCost > 0 ? player.form / (player.nowCost / 10) : 0,
          ownershipPct: player.selectedByPercent,
          priceRiseCount: player.priceChanges.length,
          fixtureScore: player.fixtureScore,
          dcAvgPerGame,
          dcHitRatePct,
          isDgwNext: teamGwStatus?.fixtureCount === 2,
          isBgwNext: teamGwStatus?.fixtureCount === 0,
        },
      });
    }

    this.logger.log(`ETL job complete — ${players.length} players processed`);
  }
}
