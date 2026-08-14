import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { Role } from '../entities/role.entity';
import { AppDataSource } from '../data-source';

@Controller('dev')
export class DevController {
  @Post('promote')
  async promote(@Body() body: { mobile: string; role: string }) {
    if (process.env.NODE_ENV === 'production') return { ok: false, message: 'Not allowed' };
    const { mobile, role } = body;
    const userRepo = AppDataSource.getRepository('users');
    const roleRepo = AppDataSource.getRepository(Role);
    const user = await userRepo.findOne({ where: { mobile } as any });
    if (!user) return { ok: false, message: 'User not found' };
    let r = await roleRepo.findOne({ where: { name: role } as any });
    if (!r) return { ok: false, message: 'Role not found' };
    // insert into user_roles
    await AppDataSource.createQueryBuilder().insert().into('user_roles').values({ userId: user.id, roleId: r.id }).orIgnore().execute();
    return { ok: true };
  }
}
