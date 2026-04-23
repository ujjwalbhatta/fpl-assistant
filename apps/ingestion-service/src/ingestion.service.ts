import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from './prisma.service';
import axios from 'axios';

const FPL_URL = 'https://fantasy.premierleague.com/api/bootstrap-static/';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private prisma: PrismaService) {}

  @Cron('0 * * * *')
  async pollFplApi() {
    this.logger.log('Polling FPL API...');
    const { data } = await axios.get(FPL_URL);

    for (const p of data.elements) {
      const dbPlayer = await this.prisma.player.findUnique({
        where: { id: p.id },
      });

      if (!dbPlayer) continue;

      if (dbPlayer.nowCost !== p.now_cost) {
        await this.prisma.priceHistory.create({
          data: {
            playerId: p.id,
            oldCost: dbPlayer.nowCost,
            newCost: p.now_cost,
          },
        });

        await this.prisma.player.update({
          where: { id: p.id },
          data: { nowCost: p.now_cost },
        });

        this.logger.log(
          `Price change: player ${p.id} ${dbPlayer.nowCost} → ${p.now_cost}`,
        );
      }
    }
  }
}
