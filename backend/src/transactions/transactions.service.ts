import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService, Transaction } from '../database/database.service';
import { TaxService } from '../tax/tax.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
import * as crypto from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly taxService: TaxService
  ) {}

  private verifyUser(userId: string) {
    const user = this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    return user;
  }

  getTransactions(userId: string): Transaction[] {
    this.verifyUser(userId);
    return this.db.getTransactions(userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  createTransaction(
    userId: string,
    data: CreateTransactionDto
  ): Transaction {
    const user = this.verifyUser(userId);
    const id = crypto.randomUUID();

    let vatAmount = 0;
    let payeAmount = 0;
    let whtAmount = 0;

    // Automated Tax Calculation based on user profile and transaction details
    if (data.type === 'income') {
      vatAmount = this.taxService.calculateVat(data.amount, user.vatRegistered);
      whtAmount = this.taxService.calculateWht(data.amount, data.category);
    } else if (data.type === 'expense') {
      // Expenses may carry input VAT that we can deduct
      vatAmount = this.taxService.calculateVat(data.amount, user.vatRegistered);
      whtAmount = this.taxService.calculateWht(data.amount, data.category);
    } else if (data.type === 'payroll') {
      const payeCalculations = this.taxService.calculatePaye(data.amount);
      payeAmount = payeCalculations.taxOwed;
    }

    const transaction: Transaction = {
      id,
      userId,
      type: data.type,
      amount: data.amount,
      category: data.category,
      date: data.date,
      description: data.description,
      vatAmount,
      payeAmount,
      whtAmount,
    };

    return this.db.createTransaction(transaction);
  }

  updateTransaction(
    userId: string,
    id: string,
    updates: UpdateTransactionDto
  ): Transaction {
    const user = this.verifyUser(userId);
    const existing = this.db.getTransactionById(id);

    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Transaction not found`);
    }

    // Merge updates
    const merged = { ...existing, ...updates };

    // Re-calculate tax amounts based on merged transaction properties
    let vatAmount = 0;
    let payeAmount = 0;
    let whtAmount = 0;

    if (merged.type === 'income') {
      vatAmount = this.taxService.calculateVat(merged.amount, user.vatRegistered);
      whtAmount = this.taxService.calculateWht(merged.amount, merged.category);
    } else if (merged.type === 'expense') {
      vatAmount = this.taxService.calculateVat(merged.amount, user.vatRegistered);
      whtAmount = this.taxService.calculateWht(merged.amount, merged.category);
    } else if (merged.type === 'payroll') {
      const payeCalculations = this.taxService.calculatePaye(merged.amount);
      payeAmount = payeCalculations.taxOwed;
    }

    return this.db.updateTransaction(id, {
      type: merged.type,
      amount: merged.amount,
      category: merged.category,
      date: merged.date,
      description: merged.description,
      vatAmount,
      payeAmount,
      whtAmount,
    });
  }

  deleteTransaction(userId: string, id: string): boolean {
    this.verifyUser(userId);
    const existing = this.db.getTransactionById(id);
    if (!existing || existing.userId !== userId) {
      throw new NotFoundException(`Transaction not found`);
    }
    return this.db.deleteTransaction(id);
  }
}
