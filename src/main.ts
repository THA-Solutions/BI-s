import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  Logger.log(`Server running on ${process.env.PORT || 3000}`, 'Port');
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
