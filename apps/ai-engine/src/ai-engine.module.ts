import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { AiEngineController } from './ai-engine.controller';
import { AiEngineService } from './ai-engine.service';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv('redis://localhost:6379')],
    }),
  ],
  controllers: [AiEngineController],
  providers: [AiEngineService, PrismaService],
})
export class AiEngineModule {}
