import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SalonsModule } from './salons/salons.module';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { Salon } from './entities/salon.entity';
import { SalonAddress } from './entities/salon-address.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'postgres',
      database: process.env.DATABASE_NAME || 'salonbeauty_dev',
      entities: [User, Role, Salon, SalonAddress],
      synchronize: true, // dev only
    }),
    AuthModule,
    UsersModule,
    SalonsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
