import { NestFactory } from '@nestjs/core';
import { StreamProcessorModule } from './stream.module';

async function bootstrap() {
  const app = await NestFactory.create(StreamProcessorModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
