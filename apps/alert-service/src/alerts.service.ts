import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { AlertsGateway } from './alerts.gateway';

interface PriceChangeEvent {
  playerId: number;
  oldCost: number;
  newCost: number;
}

@Injectable()
export class AlertsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlertsService.name);

  private consumer: Consumer;

  constructor(private readonly gateway: AlertsGateway) {}

  async onModuleInit() {
    this.consumer = new Kafka({
      clientId: 'alert-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9093'],
    }).consumer({ groupId: 'fpl-alert-group' });

    try {
      await this.consumer.connect();
      this.logger.log('Kafka consumer connected');
      await this.consumer.subscribe({
        topic: 'fpl.price-change',
        fromBeginning: false,
      });
      await this.consumer.run({
        // eslint-disable-next-line @typescript-eslint/require-await
        eachMessage: async ({ message }): Promise<void> => {
          const raw = message.value?.toString();
          if (!raw) return;

          const event: PriceChangeEvent = JSON.parse(raw);
          this.logger.log(
            `Price change: player ${event.playerId} ${event.oldCost} → ${event.newCost}`,
          );

          this.gateway.emitPriceChange({
            player: `Player ${event.playerId}`,
            oldPrice: event.oldCost / 10,
            newPrice: event.newCost / 10,
          });
        },
      });
    } catch (err) {
      this.logger.error('Kafka consumer failed to start', err);
    }
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
