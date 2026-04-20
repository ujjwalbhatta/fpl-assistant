import { NestFactory } from '@nestjs/core';
import { AlertServiceModule } from './alert-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AlertServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
