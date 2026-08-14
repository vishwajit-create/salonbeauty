import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthV2Module } from '../auth/auth.v2.module';
import { UsersModule } from '../users/users.module';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

describe('Auth V2 (email+mobile OTP) - basic', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, Role, __dirname + '/../entities/*.ts'],
          synchronize: true,
        }),
        AuthV2Module,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('send-otp accepts email', async () => {
    const res = await request(app.getHttpServer()).post('/auth/send-otp').send({ email: 'test@example.com' }).expect(200);
    expect(res.body.success).toBe(true);
  });
});
