import { NestFactory } from '@nestjs/core';
import { IngestionModule } from './ingestion.module';

async function bootstrap() {
  const app = await NestFactory.create(IngestionModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
