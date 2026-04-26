import { NestFactory } from '@nestjs/core';
import { AiEngineModule } from './ai-engine.module';

async function bootstrap() {
  const app = await NestFactory.create(AiEngineModule);
  await app.listen(3002);
}
bootstrap();
