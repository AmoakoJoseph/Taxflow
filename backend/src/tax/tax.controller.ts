import { Controller, Get, Query, Headers, UnauthorizedException } from '@nestjs/common';
import { TaxService } from './tax.service';
import { VatQueryDto } from './vat-query.dto';
import { DatabaseService } from '../database/database.service';

@Controller('api/tax')
export class TaxController {
  constructor(
    private readonly taxService: TaxService,
    private readonly db: DatabaseService
  ) {}

  private extractUserId(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer taxflow-session-')) {
      throw new UnauthorizedException('Please login to access this resource');
    }
    return authHeader.replace('Bearer taxflow-session-', '');
  }

  @Get('vat')
  getVatReport(
    @Headers('authorization') authHeader: string | undefined,
    @Query() query: VatQueryDto
  ) {
    const userId = this.extractUserId(authHeader);
    
    // Retrieve transactions for this specific user
    const userTransactions = this.db.getTransactions(userId);
    
    // Orchestrate report calculation via TaxService -> VatService
    return this.taxService.calculateVATReport(
      userTransactions,
      query.startDate,
      query.endDate
    );
  }
}
