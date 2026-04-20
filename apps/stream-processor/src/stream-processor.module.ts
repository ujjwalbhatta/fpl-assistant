import { Module } from '@nestjs/common';
import { StreamProcessorController } from './stream-processor.controller';
import { StreamProcessorService } from './stream-processor.service';

@Module({
  imports: [],
  controllers: [StreamProcessorController],
  providers: [StreamProcessorService],
})
export class StreamProcessorModule {}
