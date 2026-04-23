import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class KafkaProducerService implements OnModuleInit, OnModuleDestroy {
  private producer: Producer = new Kafka({
    clientId: 'ingestion-service',
    brokers: [process.env.KAFKA_BROKER || ''],
  }).producer();

  async onModuleInit() {
    await this.producer.connect();
  }

  async publish(topic: string, message: object) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}
