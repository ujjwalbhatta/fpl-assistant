import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PlayersService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  private async getTopByPosition(position: number, limit: number) {
    const players = await this.prisma.player.findMany({
      where: { position },
      include: { team: true },
    });

    return players
      .map((player) => ({
        id: player.id,
        webName: player.webName,
        team: player.team.shortName,
        nowCost: player.nowCost / 10,
        form: player.form,
        valueIndex: player.nowCost > 0 ? player.form / player.nowCost : 0,
        totalPoints: player.totalPoints,
        pointsPerGame: player.pointsPerGame,
        selectedByPercent: player.selectedByPercent,
        chanceOfPlayingNextRound: player.chanceOfPlayingNextRound,
        news: player.news,
      }))
      .sort((a, b) => b.valueIndex - a.valueIndex)
      .slice(0, limit);
  }

  async getTopPicks() {
    const cached = await this.cache.get('top-picks');
    if (cached) return cached;

    const [GK, DEF, MID, FWD] = await Promise.all([
      this.getTopByPosition(1, 3),
      this.getTopByPosition(2, 5),
      this.getTopByPosition(3, 5),
      this.getTopByPosition(4, 3),
    ]);

    const result = { GK, DEF, MID, FWD };

    await this.cache.set('top-picks', result, 3600);
    return result;
  }
}
