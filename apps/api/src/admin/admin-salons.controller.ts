import { Controller, Patch, Param, Req, Get } from '@nestjs/common';
import { SalonsService } from '../salons/salons.service';

@Controller('admin/salons')
export class AdminSalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Get('pending')
  async pending(@Req() req: any) {
    if (!req.user || !req.user.roles || !req.user.roles.includes('ADMIN')) return { ok: false, message: 'Unauthorized' };
    const items = await this.salonsService.listPending();
    return { ok: true, items };
  }

  @Patch(':id/approve')
  async approve(@Req() req: any, @Param('id') id: string) {
    if (!req.user || !req.user.roles || !req.user.roles.includes('ADMIN')) return { ok: false, message: 'Unauthorized' };
    const updated = await this.salonsService.setStatus(id, 'APPROVED');
    if (!updated) return { ok: false, message: 'Not found' };
    return { ok: true, salon: updated };
  }

  @Patch(':id/reject')
  async reject(@Req() req: any, @Param('id') id: string) {
    if (!req.user || !req.user.roles || !req.user.roles.includes('ADMIN')) return { ok: false, message: 'Unauthorized' };
    const updated = await this.salonsService.setStatus(id, 'REJECTED');
    if (!updated) return { ok: false, message: 'Not found' };
    return { ok: true, salon: updated };
  }
}
