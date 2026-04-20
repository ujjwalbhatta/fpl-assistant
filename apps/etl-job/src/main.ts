import { NestFactory } from '@nestjs/core';
import { EtlJobModule } from './etl-job.module';

async function bootstrap() {
  const app = await NestFactory.create(EtlJobModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
