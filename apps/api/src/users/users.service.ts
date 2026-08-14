import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Role) private readonly rolesRepo: Repository<Role>,
  ) {}

  async findByMobile(mobile: string) {
    return this.usersRepo.findOne({ where: { mobile }, relations: ['roles'] });
  }

  async findById(id: string) {
    return this.usersRepo.findOne({ where: { id }, relations: ['roles'] });
  }

  async create(payload: { mobile: string; name?: string }) {
    // default role: USER
    let role = await this.rolesRepo.findOne({ where: { name: 'USER' } });
    if (!role) {
      role = this.rolesRepo.create({ name: 'USER' });
      await this.rolesRepo.save(role);
    }
    const user = this.usersRepo.create({ mobile: payload.mobile, name: payload.name || null, roles: [role] });
    return this.usersRepo.save(user);
  }
}
