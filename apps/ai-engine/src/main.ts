import { NestFactory } from '@nestjs/core';
import { AiEngineModule } from './ai-engine.module';

async function bootstrap() {
  const app = await NestFactory.create(AiEngineModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
