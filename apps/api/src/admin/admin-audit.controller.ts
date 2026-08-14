import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Controller('admin/audit')
@UseGuards(RolesGuard)
export class AdminAuditController {
  constructor(@InjectRepository(AuditLog) private readonly auditRepo: Repository<AuditLog>) {}

  @Get()
  @Roles('ADMIN')
  async list(@Req() req: any) {
    const items = await this.auditRepo.find({ relations: ['performedBy', 'salon'], order: { created_at: 'DESC' }, take: 200 });
    return { ok: true, items };
  }
}
