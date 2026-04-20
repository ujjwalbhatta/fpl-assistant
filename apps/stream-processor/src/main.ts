import { NestFactory } from '@nestjs/core';
import { StreamProcessorModule } from './stream-processor.module';

async function bootstrap() {
  const app = await NestFactory.create(StreamProcessorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
