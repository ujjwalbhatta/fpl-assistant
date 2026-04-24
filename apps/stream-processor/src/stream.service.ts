import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { PrismaService } from './prisma.service';

interface PriceChangeEvent {
  playerId: number;
  oldCost: number;
  newCost: number;
}

@Injectable()
export class StreamService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(StreamService.name);

  private consumer: Consumer = new Kafka({
    clientId: 'stream-processor',
    brokers: [process.env.KAFKA_BROKER || ''],
  }).consumer({ groupId: process.env.KAFKA_GROUP_ID || '' });

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'fpl.price-change',
      fromBeginning: true,
    });
    await this.consumer.run({
      eachMessage: async ({ message }) => {
        const raw = message.value?.toString();
        if (!raw) return;

        const event: PriceChangeEvent = JSON.parse(raw);
        await this.enrichPlayer(event);
      },
    });
  }

  private async enrichPlayer({ playerId, newCost }: PriceChangeEvent) {
    const player = await this.prisma.player.findUnique({
      where: { id: playerId },
      select: { form: true },
    });

    if (!player) {
      this.logger.warn(`Player ${playerId} not found in DB`);
      return;
    }

    const valueIndex = newCost > 0 ? player.form / newCost : 0;

    await this.prisma.player.update({
      where: { id: playerId },
      data: { nowCost: newCost, valueIndex },
    });

    this.logger.log(
      `Player ${playerId}: cost ${newCost}, valueIndex ${valueIndex.toFixed(4)}`,
    );
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
