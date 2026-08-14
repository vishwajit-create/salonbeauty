import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as path from 'path';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Serve uploads statically
  const uploadsPath = path.join(process.cwd(), 'uploads');
  app.use('/uploads', express.static(uploadsPath));

  // Serve admin UI
  const publicPath = path.join(process.cwd(), 'public');
  app.use('/admin', express.static(path.join(publicPath, 'admin')));

  // Simple middleware to parse JWT and attach user to request for controllers
  app.use(async (req: any, _res, next) => {
    const auth = req.headers?.authorization as string | undefined;
    if (auth && auth.startsWith('Bearer ')) {
      const token = auth.slice(7);
      try {
        const jwt = await import('jsonwebtoken');
        const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_change_me');
        req.user = payload;
      } catch (e) {
        // ignore invalid token
      }
    }
    next();
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Server running on http://localhost:${port}`);
}
bootstrap();
