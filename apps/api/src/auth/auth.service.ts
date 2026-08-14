import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import * as jwt from 'jsonwebtoken';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  private redis: Redis.Redis;

  constructor(private readonly usersService: UsersService) {
    this.redis = new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async sendOtp(mobile: string) {
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    await this.redis.setex(`otp:${mobile}`, 300, otp);
    console.log(`DEV OTP for ${mobile}: ${otp}`);
    return { success: true, message: 'OTP sent (dev: logged to console)' };
  }

  async verifyOtp(mobile: string, otp: string) {
    const key = `otp:${mobile}`;
    const stored = await this.redis.get(key);
    if (!stored) {
      return { success: false, message: 'OTP expired or not found' };
    }
    if (stored !== otp) {
      return { success: false, message: 'Invalid OTP' };
    }
    // OTP valid — create or fetch user
    let user = await this.usersService.findByMobile(mobile);
    if (!user) {
      user = await this.usersService.create({ mobile });
    }
    // generate tokens
    const access = jwt.sign({ sub: user.id, mobile: user.mobile }, process.env.JWT_SECRET || 'dev_jwt_secret_change_me', { expiresIn: '1h' });
    const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret', { expiresIn: '7d' });
    await this.redis.del(key);
    return { success: true, access, refresh };
  }
}
