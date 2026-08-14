import { Controller, Get, Req } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async me(@Req() req: any) {
    if (!req.user) return { ok: false, message: 'Unauthorized' };
    const user = await this.usersService.findById(req.user.sub);
    return { ok: true, user };
  }
}
