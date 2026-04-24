import { NestFactory } from '@nestjs/core';
import { StreamProcessorModule } from './stream.module';

async function bootstrap() {
  const app = await NestFactory.create(StreamProcessorModule);
  await app.init();
}
bootstrap();
