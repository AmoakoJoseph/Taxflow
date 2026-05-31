import { Controller, Get, Post, Put, Delete, Body, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { TransactionsService } from './transactions.service';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  private extractUserId(authHeader?: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer taxflow-session-')) {
      throw new UnauthorizedException('Please login to access this resource');
    }
    return authHeader.replace('Bearer taxflow-session-', '');
  }

  @Get()
  getTransactions(@Headers('authorization') authHeader?: string) {
    const userId = this.extractUserId(authHeader);
    return this.transactionsService.getTransactions(userId);
  }

  @Post()
  createTransaction(
    @Headers('authorization') authHeader: string | undefined,
    @Body() body: {
      type: 'income' | 'expense' | 'payroll';
      amount: number;
      category: string;
      date: string;
      description: string;
    }
  ) {
    const userId = this.extractUserId(authHeader);
    return this.transactionsService.createTransaction(userId, body);
  }

  @Put(':id')
  updateTransaction(
    @Headers('authorization') authHeader: string | undefined,
    @Param('id') id: string,
    @Body() body: {
      type?: 'income' | 'expense' | 'payroll';
      amount?: number;
      category?: string;
      date?: string;
      description?: string;
    }
  ) {
    const userId = this.extractUserId(authHeader);
    return this.transactionsService.updateTransaction(userId, id, body);
  }

  @Delete(':id')
  deleteTransaction(@Headers('authorization') authHeader: string | undefined, @Param('id') id: string) {
    const userId = this.extractUserId(authHeader);
    const success = this.transactionsService.deleteTransaction(userId, id);
    return { success };
  }
}
