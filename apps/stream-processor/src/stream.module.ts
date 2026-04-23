import { Module } from '@nestjs/common';
import { StreamService } from './stream.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [StreamService, PrismaService],
})
export class StreamProcessorModule {}
