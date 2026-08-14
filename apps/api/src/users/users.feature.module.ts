import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Role } from './entities/role.entity';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { CustomerProfile } from './entities/customer-profile.entity';
import { CustomerAddress } from './entities/customer-address.entity';
import { CustomerFavorite } from './entities/customer-favorite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, CustomerProfile, CustomerAddress, CustomerFavorite])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersFeatureModule {}
