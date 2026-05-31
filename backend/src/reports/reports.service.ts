import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DatabaseService, Transaction, Notification } from '../database/database.service';

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
    whtSuffered: number; // Tax withheld from our income by clients (asset credit)
    whtWithheld: number; // Tax we withheld from suppliers (liability to remit to GRA)
    netWhtBalance: number;
  };
  totalEstimatedTaxOwed: number; // VAT Payable + PAYE + WHT Withheld
}

@Injectable()
export class ReportsService {
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

    // Apply date filters if provided
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
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      totalPayroll: Math.round(totalPayroll * 100) / 100,
      netProfit: Math.round((totalIncome - totalExpense - totalPayroll) * 100) / 100,
      vatBreakdown: {
        outputVat: Math.round(outputVat * 100) / 100,
        inputVat: Math.round(inputVat * 100) / 100,
        vatPayable: Math.round(vatPayable * 100) / 100,
      },
      payeBreakdown: {
        totalPaye: Math.round(totalPaye * 100) / 100,
      },
      whtBreakdown: {
        whtSuffered: Math.round(whtSuffered * 100) / 100,
        whtWithheld: Math.round(whtWithheld * 100) / 100,
        netWhtBalance: Math.round((whtWithheld - whtSuffered) * 100) / 100,
      },
      totalEstimatedTaxOwed: Math.round(totalEstimatedTaxOwed * 100) / 100,
    };
  }

  getNotifications(userId: string): Notification[] {
    this.verifyUser(userId);
    
    // Check if there are upcoming deadlines and dynamically inject notifications
    const today = new Date();
    const currentDay = today.getDate();
    const nextMonthName = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' });
    
    const userNotifications = this.db.getNotifications(userId);
    
    // Check if we need to auto-generate GRA monthly filing reminders
    // In Ghana, PAYE, VAT, and Withholding Tax filings are due by the 15th of the following month
    const deadlineDay = 15;
    const daysRemaining = deadlineDay - currentDay;

    if (daysRemaining > 0 && daysRemaining <= 15) {
      const reminderTitle = 'Filing Deadline Approaching ⏳';
      const exists = userNotifications.some(n => n.title === reminderTitle && !n.read);
      
      if (!exists) {
        this.db.createNotification({
          id: Math.random().toString(36).substring(2),
          userId,
          type: 'warning',
          title: reminderTitle,
          message: `GRA filing deadline is coming up on the 15th of ${nextMonthName}. Ensure all VAT, PAYE, and Withholding taxes are finalized.`,
          date: today.toISOString().split('T')[0],
          read: false,
        });
      }
    }

    return this.db.getNotifications(userId).sort((a, b) => b.date.localeCompare(a.date));
  }

  readNotification(userId: string, id: string): boolean {
    this.verifyUser(userId);
    return this.db.markNotificationAsRead(id);
  }
}
