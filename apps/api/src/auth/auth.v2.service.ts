import * as bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { AppDataSource } from '../data-source';
import { OtpRequest } from '../entities/otp-request.entity';
import { UsersService } from '../users/users.service';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as jwt from 'jsonwebtoken';
import { UserSession } from '../entities/user-session.entity';

@Injectable()
export class AuthServiceV2 {
  private redis: Redis.Redis;
  constructor(private readonly usersService: UsersService) {
    this.redis = new Redis({ host: process.env.REDIS_HOST || '127.0.0.1', port: parseInt(process.env.REDIS_PORT || '6379', 10) });
  }

  async sendOtp(destination: { mobile?: string; email?: string }, meta: { ip?: string; ua?: string }) {
    const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
    const key = destination.mobile ? `otp:${destination.mobile}` : `otp:email:${destination.email}`;
    // store otp in redis
    await this.redis.setex(key, 300, otp);
    // store OTP request record (hash otp)
    const otpRepo = AppDataSource.getRepository(OtpRequest);
    const hash = await bcrypt.hash(otp, 10);
    const rec = otpRepo.create({ mobile: destination.mobile, email: destination.email, otp_hash: hash, ip: meta.ip, user_agent: meta.ua });
    await otpRepo.save(rec);
    // For dev, log OTP
    console.log(`DEV OTP for ${destination.mobile || destination.email}: ${otp}`);
    return { success: true, message: 'OTP sent (dev: logged to console)' };
  }

  async verifyOtp(destination: { mobile?: string; email?: string }, otp: string, meta: { ip?: string; ua?: string }) {
    const key = destination.mobile ? `otp:${destination.mobile}` : `otp:email:${destination.email}`;
    const stored = await this.redis.get(key);
    if (!stored) return { success: false, message: 'OTP expired' };
    if (stored !== otp) return { success: false, message: 'Invalid OTP' };
    // find the latest otp request record for destination
    const otpRepo = AppDataSource.getRepository(OtpRequest);
    const rec = await otpRepo.findOne({ where: destination as any, order: { created_at: 'DESC' } });
    if (!rec) return { success: false, message: 'OTP record not found' };
    const match = await bcrypt.compare(otp, rec.otp_hash);
    if (!match) return { success: false, message: 'OTP mismatch' };
    rec.consumed = true;
    await otpRepo.save(rec);
    await this.redis.del(key);

    // create or fetch user
    let user = destination.mobile ? await this.usersService.findByMobile(destination.mobile) : null;
    if (!user && destination.email) user = await this.usersService.findByEmail(destination.email);
    if (!user) {
      user = await this.usersService.create({ mobile: destination.mobile || null, email: destination.email || null });
    }

    // load roles
    const userReload = await this.usersService.findById(user.id);
    const roles = (userReload.roles || []).map((r: any) => r.name);

    // create session
    const sessionRepo = AppDataSource.getRepository(UserSession);
    const session = sessionRepo.create({ user_id: user.id, ip: meta.ip, user_agent: meta.ua, device: 'unknown' });
    await sessionRepo.save(session);

    // issue tokens and persist refresh token hash
    const access = jwt.sign({ sub: user.id, mobile: user.mobile, email: user.email, roles }, process.env.JWT_SECRET || 'dev_jwt_secret_change_me', { expiresIn: '1h' });
    const refreshRaw = jwt.sign({ sub: user.id, sid: session.id }, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret', { expiresIn: '7d' });
    const refreshHash = await bcrypt.hash(refreshRaw, 10);
    const rtRepo = AppDataSource.getRepository(RefreshToken);
    const rt = rtRepo.create({ user_id: user.id, token_hash: refreshHash });
    await rtRepo.save(rt);
    return { success: true, access, refresh: refreshRaw };
  }

  async refresh(refreshTokenRaw: string) {
    try {
      const payload: any = jwt.verify(refreshTokenRaw, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret');
      const rtRepo = AppDataSource.getRepository(RefreshToken);
      const stored = await rtRepo.findOne({ where: { revoked: false, user_id: payload.sub }, order: { created_at: 'DESC' } });
      if (!stored) return { success: false, message: 'Refresh token not found' };
      const match = await bcrypt.compare(refreshTokenRaw, stored.token_hash);
      if (!match) return { success: false, message: 'Invalid refresh token' };
      // rotate: revoke old and store new
      stored.revoked = true;
      const newRefreshRaw = jwt.sign({ sub: payload.sub }, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret', { expiresIn: '7d' });
      const newHash = await bcrypt.hash(newRefreshRaw, 10);
      stored.replaced_by = newHash;
      await rtRepo.save(stored);
      const newRt = rtRepo.create({ user_id: payload.sub, token_hash: newHash });
      await rtRepo.save(newRt);
      const user = await this.usersService.findById(payload.sub);
      const roles = (user.roles || []).map((r: any) => r.name);
      const access = jwt.sign({ sub: user.id, mobile: user.mobile, email: user.email, roles }, process.env.JWT_SECRET || 'dev_jwt_secret_change_me', { expiresIn: '1h' });
      return { success: true, access, refresh: newRefreshRaw };
    } catch (e) {
      return { success: false, message: 'Invalid refresh token' };
    }
  }

  async logout(refreshTokenRaw: string) {
    try {
      const payload: any = jwt.verify(refreshTokenRaw, process.env.JWT_REFRESH_SECRET || 'dev_jwt_refresh_secret');
      const rtRepo = AppDataSource.getRepository(RefreshToken);
      const stored = await rtRepo.findOne({ where: { user_id: payload.sub }, order: { created_at: 'DESC' } });
      if (stored) {
        stored.revoked = true;
        await rtRepo.save(stored);
      }
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Invalid token' };
    }
  }
}
