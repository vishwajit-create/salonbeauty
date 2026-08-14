import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  private driver = process.env.UPLOAD_DRIVER || 'local';
  private s3Client: S3Client | null = null;
  private bucket = process.env.S3_BUCKET;

  constructor() {
    if (this.driver === 's3') {
      this.s3Client = new S3Client({ region: process.env.S3_REGION });
    }
  }

  async uploadLocal(salonId: string, file: Express.Multer.File) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'salons', salonId);
    fs.mkdirSync(uploadDir, { recursive: true });
    const filename = `${Date.now()}${path.extname(file.originalname)}`;
    const dest = path.join(uploadDir, filename);
    fs.writeFileSync(dest, file.buffer);
    return `/uploads/salons/${salonId}/${filename}`;
  }

  async uploadS3(salonId: string, file: Express.Multer.File) {
    if (!this.s3Client) throw new Error('S3 client not configured');
    if (!this.bucket) throw new Error('S3_BUCKET not configured');
    const key = `salons/${salonId}/${Date.now()}${path.extname(file.originalname)}`;
    const cmd = new PutObjectCommand({ Bucket: this.bucket, Key: key, Body: file.buffer, ContentType: file.mimetype });
    await this.s3Client.send(cmd);
    // Construct a public URL (assumes bucket is public or uses CloudFront)
    const region = process.env.S3_REGION;
    return `https://${this.bucket}.s3.${region}.amazonaws.com/${key}`;
  }

  async upload(salonId: string, file: Express.Multer.File) {
    if (this.driver === 's3') return this.uploadS3(salonId, file);
    return this.uploadLocal(salonId, file);
  }
}
