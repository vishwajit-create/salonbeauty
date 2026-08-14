import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';
import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { UsersModule } from '../../users/users.module';
import { SalonsModule } from '../../salons/salons.module';
import { User } from '../../entities/user.entity';
import { Role } from '../../entities/role.entity';

jest.setTimeout(120000);

describe('E2E admin approve + upload validation (containers)', () => {
  let app: INestApplication;
  let pgContainer: StartedTestContainer;
  let redisContainer: StartedTestContainer;

  beforeAll(async () => {
    pgContainer = await new GenericContainer('postgres', '15')
      .withEnv('POSTGRES_USER', 'postgres')
      .withEnv('POSTGRES_PASSWORD', 'postgres')
      .withEnv('POSTGRES_DB', 'testdb')
      .withExposedPorts(5432)
      .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
      .start();

    redisContainer = await new GenericContainer('redis', '7')
      .withExposedPorts(6379)
      .start();

    const pgPort = pgContainer.getMappedPort(5432);
    const redisPort = redisContainer.getMappedPort(6379);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: pgContainer.getHost(),
          port: pgPort,
          username: 'postgres',
          password: 'postgres',
          database: 'testdb',
          entities: [User, Role, __dirname + '/../../entities/*.ts'],
          synchronize: true,
        }),
        AuthModule,
        UsersModule,
        SalonsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    process.env.REDIS_HOST = redisContainer.getHost();
    process.env.REDIS_PORT = String(redisPort);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pgContainer.stop();
    await redisContainer.stop();
  });

  it('runs send-otp and verify-otp and creates a salon and rejects invalid upload', async () => {
    const mobile = '9999990001';
    await request(app.getHttpServer()).post('/auth/send-otp').send({ mobile }).expect(200);
    // connect to redis directly to get otp
    const Redis = require('ioredis');
    const redis = new Redis({ host: process.env.REDIS_HOST, port: parseInt(process.env.REDIS_PORT, 10) });
    const otp = await redis.get(`otp:${mobile}`);
    expect(otp).toBeDefined();
    const v = await request(app.getHttpServer()).post('/auth/verify-otp').send({ mobile, otp }).expect(200);
    expect(v.body.success).toBe(true);
    const access = v.body.access;
    // create salon
    const salonRes = await request(app.getHttpServer()).post('/salons').set('Authorization', `Bearer ${access}`).send({ name: 'Test Salon' }).expect(200);
    expect(salonRes.body.ok).toBe(true);
    const salonId = salonRes.body.salon.id;
    // attempt upload with invalid type
    const invalid = await request(app.getHttpServer()).post(`/salons/${salonId}/photos`).set('Authorization', `Bearer ${access}`).attach('photo', Buffer.from('abc'), 'test.txt');
    expect(invalid.body.ok).toBe(false);
  });
});
