import { Injectable } from '@nestjs/common';
import { Transaction } from '../database/database.service';

export interface VatReport {
  outputVAT: number;
  inputVAT: number;
  payableVAT: number;
}

@Injectable()
export class VatService {
  private readonly VAT_RATE = 0.20;

  /**
   * Calculates VAT from a VAT-inclusive amount.
   * Extraction Formula: vat = amount - (amount / (1 + VAT_RATE))
   * Where VAT_RATE = 0.20 (so 1 + VAT_RATE = 1.2)
   */
  calculateVat(amount: number, isVatRegistered: boolean): number {
    if (!isVatRegistered || amount <= 0) return 0;
    const vat = amount - (amount / (1 + this.VAT_RATE));
    return Math.round(vat * 100) / 100;
  }

  /**
   * Performs date filtering and VAT aggregation for income and expenses.
   */
  calculateVATReport(transactions: Transaction[], startDate?: string, endDate?: string): VatReport {
    let filtered = transactions;

    if (startDate) {
      filtered = filtered.filter(t => t.date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.date <= endDate);
    }

    let outputVAT = 0;
    let inputVAT = 0;

    for (const t of filtered) {
      if (t.type === 'income') {
        outputVAT += t.vatAmount;
      } else if (t.type === 'expense') {
        inputVAT += t.vatAmount;
      }
    }

    const payableVAT = outputVAT - inputVAT;

    return {
      outputVAT: Math.round(outputVAT * 100) / 100,
      inputVAT: Math.round(inputVAT * 100) / 100,
      payableVAT: Math.round(payableVAT * 100) / 100,
    };
  }
}
