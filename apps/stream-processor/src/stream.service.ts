import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';

@Injectable()
export class StreamService implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer = new Kafka({
    clientId: 'stream-processor',
    brokers: [process.env.KAFKA_BROKER || ''],
  }).consumer({ groupId: process.env.KAFKA_GROUP_ID || '' });

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({
      topic: 'fpl.price-change',
      fromBeginning: true,
    });
    await this.consumer.run({
      // eslint-disable-next-line @typescript-eslint/require-await
      eachMessage: async ({ message }) => {
        console.log(message.value?.toString());
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
