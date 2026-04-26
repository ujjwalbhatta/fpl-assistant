import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EtlService } from './etl.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [EtlService, PrismaService],
})
export class EtlJobModule {}
