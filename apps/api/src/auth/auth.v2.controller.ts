import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthServiceV2 } from './auth.v2.service';

@Controller('auth')
export class AuthV2Controller {
  constructor(private readonly auth: AuthServiceV2) {}

  @Post('send-otp')
  async sendOtp(@Body() body: { mobile?: string; email?: string }, @Req() req: any) {
    const meta = { ip: req.ip || req.headers['x-forwarded-for'] || null, ua: req.headers['user-agent'] };
    return this.auth.sendOtp({ mobile: body.mobile, email: body.email }, meta);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { mobile?: string; email?: string; otp: string }, @Req() req: any) {
    const meta = { ip: req.ip || req.headers['x-forwarded-for'] || null, ua: req.headers['user-agent'] };
    return this.auth.verifyOtp({ mobile: body.mobile, email: body.email }, body.otp, meta);
  }

  @Post('refresh')
  async refresh(@Body() body: { refresh: string }) {
    return this.auth.refresh(body.refresh);
  }

  @Post('logout')
  async logout(@Body() body: { refresh: string }) {
    return this.auth.logout(body.refresh);
  }
}
