import { Controller, Get, Query, Req } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Get('presign')
  async presign(@Req() req: any, @Query('salonId') salonId: string, @Query('filename') filename: string, @Query('contentType') contentType: string) {
    if (!req.user) return { ok: false, message: 'Unauthorized' };
    // ownership checks could be added here; for now just require auth
    try {
      const data = await this.uploadService.getPresignedUrl(salonId, filename, contentType);
      return { ok: true, ...data };
    } catch (e: any) {
      return { ok: false, message: e.message };
    }
  }
}
