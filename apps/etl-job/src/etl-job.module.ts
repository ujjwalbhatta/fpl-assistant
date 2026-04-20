import { Module } from '@nestjs/common';
import { EtlJobController } from './etl-job.controller';
import { EtlJobService } from './etl-job.service';

@Module({
  imports: [],
  controllers: [EtlJobController],
  providers: [EtlJobService],
})
export class EtlJobModule {}
