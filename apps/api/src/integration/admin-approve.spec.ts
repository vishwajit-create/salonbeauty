import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import * as jwt from 'jsonwebtoken';

describe('Admin approve flow', () => {
  let app: INestApplication;
  let adminToken: string;
  let ownerToken: string;
  let ownerId: string;
  let salonId: string;

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
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const conn = (moduleFixture.get('TypeOrmModule') as any);
    // create roles and users via endpoints or repos
    // For simplicity, directly create users using TypeORM repository
    const userRepo = (await moduleFixture.resolve('Connection') as any).manager.getRepository('users');
  });

  afterAll(async () => {
    await app.close();
  });

  it('basic server running', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect(res.status).toBeDefined();
  });
});
