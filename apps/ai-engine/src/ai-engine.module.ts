import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [AiEngineController],
  providers: [AiEngineService, PrismaService],
})
export class AiEngineModule {}
