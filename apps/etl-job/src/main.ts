import { NestFactory } from '@nestjs/core';
import { EtlJobModule } from './etl-job.module';

async function bootstrap() {
  const app = await NestFactory.create(EtlJobModule);
  await app.init();
}
bootstrap();
