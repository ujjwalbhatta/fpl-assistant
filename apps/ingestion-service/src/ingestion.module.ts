import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionService } from './ingestion.service';
import { PrismaService } from './prisma.service';
import { KafkaProducerService } from './kafka.producer.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [IngestionService, PrismaService, KafkaProducerService],
})
export class IngestionModule {}
