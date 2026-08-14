import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Salon } from '../entities/salon.entity';
import { SalonAddress } from '../entities/salon-address.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class SalonsService {
  constructor(
    @InjectRepository(Salon) private readonly salonRepo: Repository<Salon>,
    @InjectRepository(SalonAddress) private readonly addrRepo: Repository<SalonAddress>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async create(payload: any) {
    const owner = await this.userRepo.findOne({ where: { id: payload.ownerId } });
    const salon = this.salonRepo.create({ name: payload.name, description: payload.description || null, owner });
    const saved = await this.salonRepo.save(salon);
    if (payload.address) {
      const addr = this.addrRepo.create({ salon: saved, ...payload.address });
      await this.addrRepo.save(addr);
    }
    return { ok: true, salon: saved };
  }

  async list(city?: string) {
    const qb = this.salonRepo.createQueryBuilder('s').leftJoinAndSelect('s.owner', 'owner');
    if (city) {
      qb.leftJoinAndSelect('s.id', 'id');
      // join address
      qb.leftJoinAndSelect('salon_addresses', 'addr', 'addr.salon_id = s.id');
      qb.where('addr.city = :city', { city });
    }
    const items = await qb.getMany();
    return { ok: true, items };
  }

  async getById(id: string) {
    const s = await this.salonRepo.findOne({ where: { id }, relations: ['owner'] });
    if (!s) return { ok: false, message: 'Not found' };
    const address = await this.addrRepo.findOne({ where: { salon: { id } } as any });
    return { ok: true, salon: s, address };
  }
}
