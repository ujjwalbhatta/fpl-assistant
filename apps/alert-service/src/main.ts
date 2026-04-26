import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AlertServiceModule } from './alert-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AlertServiceModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(3003);
}
bootstrap();
