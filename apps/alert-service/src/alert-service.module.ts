import { Module } from '@nestjs/common';
import { AlertsGateway } from './alerts.gateway';
import { AlertsService } from './alerts.service';

@Module({
  providers: [AlertsGateway, AlertsService],
})
export class AlertServiceModule {}
