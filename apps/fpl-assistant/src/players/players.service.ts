import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PlayersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private async getTopByPosition(position: number, limit: number, gwId: number) {
    const trends = await this.prisma.playerTrend.findMany({
      where: { gameweek: gwId, player: { position } },
      include: { player: { include: { team: true } } },
    });

    return trends
      .map((t) => ({
        id: t.player.id,
        webName: t.player.webName,
        team: t.player.team.shortName,
        nowCost: t.player.nowCost / 10,
        form: t.player.form,
        rollingAvgPts: t.rollingAvgPts,
        valueIndex: t.valueIndex,
        ownershipPct: t.ownershipPct,
        isDgwNext: t.isDgwNext,
        isBgwNext: t.isBgwNext,
        chanceOfPlayingNextRound: t.player.chanceOfPlayingNextRound,
        news: t.player.news,
      }))
      .sort((a, b) => b.rollingAvgPts - a.rollingAvgPts)
      .slice(0, limit);
  }

  async getTopPicks() {
    const cached = await this.cache.get('top-picks');
    if (cached) return cached;

    const currentGw = await this.prisma.gameweek.findFirst({ where: { isCurrent: true } });
    if (!currentGw) return { GK: [], DEF: [], MID: [], FWD: [] };

    const [GK, DEF, MID, FWD] = await Promise.all([
      this.getTopByPosition(1, 3, currentGw.id),
      this.getTopByPosition(2, 5, currentGw.id),
      this.getTopByPosition(3, 5, currentGw.id),
      this.getTopByPosition(4, 3, currentGw.id),
    ]);

    const result = { GK, DEF, MID, FWD };

    await this.cache.set('top-picks', result, 3600);
    return result;
  }
}
