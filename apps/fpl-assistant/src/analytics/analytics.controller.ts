import { Controller, Get } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('player-trends')
  getPlayerTrends() {
    return this.analyticsService.getPlayerTrends();
  }

  @Get('fixture-difficulty')
  getFixtureDifficulty() {
    return this.analyticsService.getFixtureDifficulty();
  }
}
