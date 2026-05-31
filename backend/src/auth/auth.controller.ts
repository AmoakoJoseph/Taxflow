import { Controller, Post, Get, Put, Body, Req, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private extractUserId(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer taxflow-session-')) {
      throw new UnauthorizedException('Please login to access this resource');
    }
    return authHeader.replace('Bearer taxflow-session-', '');
  }

  @Post('register')
  register(
    @Body() body: { email: string; password?: string; businessName: string; tin: string; vatRegistered: boolean; industryType: string }
  ) {
    const password = body.password || 'password123'; // fallback default
    return this.authService.register(
      body.email,
      password,
      body.businessName,
      body.tin,
      body.vatRegistered,
      body.industryType
    );
  }

  @Post('login')
  login(@Body() body: { email: string; password?: string }) {
    const password = body.password || 'password123'; // fallback default
    return this.authService.login(body.email, password);
  }

  @Get('profile')
  getProfile(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.authService.getProfile(userId);
  }

  @Put('profile')
  updateProfile(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: { businessName?: string; tin?: string; vatRegistered?: boolean; industryType?: string }
  ) {
    const userId = this.extractUserId(authHeader);
    return this.authService.updateProfile(userId, body);
  }
}
