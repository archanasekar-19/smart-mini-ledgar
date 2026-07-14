import * as dotenv from 'dotenv';
// Load environment variables early
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Set global API prefix
  app.setGlobalPrefix('api');
  
  // Enable CORS for frontend requests
  app.enableCors({
    origin: '*', // Allow all for local dev ease, can be locked down in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  
  const logger = new Logger('Bootstrap');
  logger.log(`Smart Mini-Ledger Backend is running on: http://localhost:${port}/api`);
}
bootstrap();
