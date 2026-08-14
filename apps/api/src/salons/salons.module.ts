import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Salon } from '../entities/salon.entity';
import { SalonAddress } from '../entities/salon-address.entity';
import { SalonsController } from './salons.controller';
import { SalonsService } from './salons.service';
import { User } from '../entities/user.entity';
import { SalonPhoto } from '../entities/salon-photo.entity';
import { AuditLog } from '../entities/audit-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Salon, SalonAddress, User, SalonPhoto, AuditLog])],
  controllers: [SalonsController],
  providers: [SalonsService],
  exports: [SalonsService],
})
export class SalonsModule {}
