import { Module } from '@nestjs/common';
import { AuthV2Controller } from './auth.v2.controller';
import { AuthServiceV2 } from './auth.v2.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [AuthV2Controller],
  providers: [AuthServiceV2],
  exports: [AuthServiceV2],
})
export class AuthV2Module {}
