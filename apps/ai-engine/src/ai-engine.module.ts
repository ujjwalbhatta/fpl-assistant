import { Module } from '@nestjs/common';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';

@Module({
  imports: [],
  controllers: [AiEngineController],
  providers: [AiEngineService],
})
export class AiEngineModule {}
