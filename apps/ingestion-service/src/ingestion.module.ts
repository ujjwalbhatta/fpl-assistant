import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { IngestionService } from './ingestion.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [IngestionService, PrismaService],
})
export class IngestionModule {}
