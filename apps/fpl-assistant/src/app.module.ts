import { Module } from '@nestjs/common';
import { PlayersModule } from './players/players.module';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      stores: [createKeyv('redis://localhost:6379')],
    }),
    PlayersModule,
  ],
})
export class AppModule {}
