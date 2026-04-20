import { Module } from '@nestjs/common';
import { AlertServiceController } from './alert-service.controller';
import { AlertServiceService } from './alert-service.service';

@Module({
  imports: [],
  controllers: [AlertServiceController],
  providers: [AlertServiceService],
})
export class AlertServiceModule {}
