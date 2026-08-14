import { Controller, Get, Post, Param, Body, UseGuards } from '@nestjs/common';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';

@Controller('admin/users')
@UseGuards(RolesGuard)
export class AdminUsersController {
  @Get()
  @Roles('ADMIN')
  async list() {
    const userRepo = AppDataSource.getRepository('users');
    const items = await userRepo.find();
    return { ok: true, items };
  }

  @Post(':id/roles')
  @Roles('ADMIN')
  async addRole(@Param('id') id: string, @Body() body: { role: string }) {
    const roleRepo = AppDataSource.getRepository(Role);
    const r = await roleRepo.findOne({ where: { name: body.role } as any });
    if (!r) return { ok: false, message: 'Role not found' };
    await AppDataSource.createQueryBuilder().insert().into('user_roles').values({ userId: id, roleId: r.id }).orIgnore().execute();
    return { ok: true };
  }

  @Post(':id/roles/remove')
  @Roles('ADMIN')
  async removeRole(@Param('id') id: string, @Body() body: { role: string }) {
    const roleRepo = AppDataSource.getRepository(Role);
    const r = await roleRepo.findOne({ where: { name: body.role } as any });
    if (!r) return { ok: false, message: 'Role not found' };
    await AppDataSource.createQueryBuilder().delete().from('user_roles').where('userId = :userId AND roleId = :roleId', { userId: id, roleId: r.id }).execute();
    return { ok: true };
  }
}
