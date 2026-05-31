import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService, Notification } from '../database/database.service';
import { GHANA_TAX_RULES_2026 } from '../tax/tax.constants';
import * as crypto from 'crypto';

export interface TaxSummary {
  businessName: string;
  tin: string;
  vatRegistered: boolean;
  totalIncome: number;
  totalExpense: number;
  totalPayroll: number;
  netProfit: number;
  vatBreakdown: {
    outputVat: number;
    inputVat: number;
    vatPayable: number;
  };
  payeBreakdown: {
    totalPaye: number;
  };
  whtBreakdown: {
    whtSuffered: number;
    whtWithheld: number;
    netWhtBalance: number;
  };
  totalEstimatedTaxOwed: number;
}

@Injectable()
export class ReportsService {
  private readonly rules = GHANA_TAX_RULES_2026;

  constructor(private readonly db: DatabaseService) {}

  private verifyUser(userId: string) {
    const user = this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    return user;
  }

  getTaxSummary(userId: string, startDate?: string, endDate?: string): TaxSummary {
    const user = this.verifyUser(userId);
    let transactions = this.db.getTransactions(userId);

    if (startDate) {
      transactions = transactions.filter(t => t.date >= startDate);
    }
    if (endDate) {
      transactions = transactions.filter(t => t.date <= endDate);
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let totalPayroll = 0;
    let outputVat = 0;
    let inputVat = 0;
    let totalPaye = 0;
    let whtSuffered = 0;
    let whtWithheld = 0;

    for (const t of transactions) {
      if (t.type === 'income') {
        totalIncome += t.amount;
        outputVat += t.vatAmount;
        whtSuffered += t.whtAmount;
      } else if (t.type === 'expense') {
        totalExpense += t.amount;
        inputVat += t.vatAmount;
        whtWithheld += t.whtAmount;
      } else if (t.type === 'payroll') {
        totalPayroll += t.amount;
        totalPaye += t.payeAmount;
      }
    }

    const vatPayable = user.vatRegistered ? Math.max(0, outputVat - inputVat) : 0;
    const totalEstimatedTaxOwed = vatPayable + totalPaye + whtWithheld;

    return {
      businessName: user.businessName,
      tin: user.tin,
      vatRegistered: user.vatRegistered,
      totalIncome: roundMoney(totalIncome),
      totalExpense: roundMoney(totalExpense),
      totalPayroll: roundMoney(totalPayroll),
      netProfit: roundMoney(totalIncome - totalExpense - totalPayroll),
      vatBreakdown: {
        outputVat: roundMoney(outputVat),
        inputVat: roundMoney(inputVat),
        vatPayable: roundMoney(vatPayable),
      },
      payeBreakdown: {
        totalPaye: roundMoney(totalPaye),
      },
      whtBreakdown: {
        whtSuffered: roundMoney(whtSuffered),
        whtWithheld: roundMoney(whtWithheld),
        netWhtBalance: roundMoney(whtWithheld - whtSuffered),
      },
      totalEstimatedTaxOwed: roundMoney(totalEstimatedTaxOwed),
    };
  }

  getNotifications(userId: string): Notification[] {
    this.verifyUser(userId);

    const today = new Date();
    const currentDay = today.getDate();
    const nextMonthName = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', {
      month: 'long',
    });
    const userNotifications = this.db.getNotifications(userId);

    const deadlineDay = this.rules.filingDeadlines.payeAndWhtDayOfMonth;
    const daysRemaining = deadlineDay - currentDay;

    if (daysRemaining > 0 && daysRemaining <= this.rules.filingDeadlines.reminderWindowDays) {
      const reminderTitle = 'PAYE/WHT Filing Deadline Approaching';
      const exists = userNotifications.some(n => n.title === reminderTitle && !n.read);

      if (!exists) {
        this.db.createNotification({
          id: crypto.randomUUID(),
          userId,
          type: 'warning',
          title: reminderTitle,
          message: `PAYE and Withholding Tax filings are due on the 15th of ${nextMonthName}. VAT/NHIL filings are due by ${this.rules.filingDeadlines.vatDueLabel}.`,
          date: today.toISOString().split('T')[0],
          read: false,
        });
      }
    }

    return this.db.getNotifications(userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  readNotification(userId: string, id: string): boolean {
    this.verifyUser(userId);
    return this.db.markNotificationAsRead(id, userId);
  }
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
