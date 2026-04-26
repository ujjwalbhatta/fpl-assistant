import { Controller, Post, Body } from '@nestjs/common';
import { AiEngineService } from './ai-engine.service';

@Controller()
export class AiEngineController {
  constructor(private readonly aiEngineService: AiEngineService) {}

  @Post('transfer-advice')
  getTransferAdvice(@Body() body: { teamId?: number; gameweek?: number }) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.aiEngineService.getTransferAdvice(
      body.teamId ?? 4328073,
      body.gameweek ?? 34,
    );
  }
}
