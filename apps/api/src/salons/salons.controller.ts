import { Controller, Post, Body, Req, Get, Param, Query } from '@nestjs/common';
import { SalonsService } from './salons.service';

@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService) {}

  @Post()
  async create(@Req() req: any, @Body() body: any) {
    if (!req.user) return { ok: false, message: 'Unauthorized' };
    const ownerId = req.user.sub;
    return this.salonsService.create({ ...body, ownerId });
  }

  @Get()
  async list(@Query('city') city: string) {
    return this.salonsService.list(city);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.salonsService.getById(id);
  }
}
