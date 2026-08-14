import { Controller, Post, UseInterceptors, UploadedFile, Req, Param, Get, Body, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SalonsService } from './salons.service';
import { UploadService } from '../upload/upload.service';

@Controller('salons')
export class SalonsController {
  constructor(private readonly salonsService: SalonsService, private readonly uploadService: UploadService) {}

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

  @Post(':id/photos')
  @UseInterceptors(FileInterceptor('photo', { storage: memoryStorage() }))
  async uploadPhoto(@Req() req: any, @Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!req.user) return { ok: false, message: 'Unauthorized' };
    const salon = await this.salonsService.getByIdInternal(id);
    if (!salon) return { ok: false, message: 'Salon not found' };
    // allow admin or owner
    const roles = req.user.roles || [];
    if (salon.owner.id !== req.user.sub && !roles.includes('ADMIN')) return { ok: false, message: 'Forbidden' };
    const url = await this.uploadService.upload(id, file);
    await this.salonsService.addPhoto(id, url);
    return { ok: true, url };
  }
}
