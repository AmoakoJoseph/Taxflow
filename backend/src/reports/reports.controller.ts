import { Controller, Get, Put, Param, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { ReportsService } from './reports.service';

@Controller('api')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  private extractUserId(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer taxflow-session-')) {
      throw new UnauthorizedException('Please login to access this resource');
    }
    return authHeader.replace('Bearer taxflow-session-', '');
  }

  @Get('reports/summary')
  getTaxSummary(
    @Headers('authorization') authHeader: string | undefined,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const userId = this.extractUserId(authHeader);
    return this.reportsService.getTaxSummary(userId, startDate, endDate);
  }

  @Get('notifications')
  getNotifications(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.reportsService.getNotifications(userId);
  }

  @Put('notifications/:id/read')
  readNotification(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const userId = this.extractUserId(authHeader);
    const success = this.reportsService.readNotification(userId, id);
    return { success };
  }
}
