import { Injectable } from '@nestjs/common';
import { GHANA_TAX_RULES_2026 } from './tax.constants';
import { VatService, VatReport } from './vat.service';
import { Transaction } from '../database/database.service';

export interface PayeBreakdown {
  basicSalary: number;
  ssnitDeduction: number;
  chargeableIncome: number;
  taxOwed: number;
  netSalary: number;
  bracketsUsed: {
    rate: number;
    taxableInBracket: number;
    taxInBracket: number;
  }[];
}

@Injectable()
export class TaxService {
  private readonly rules = GHANA_TAX_RULES_2026;

  constructor(private readonly vatService: VatService) {}

  /**
   * Calculates PAYE (income tax) for a resident employee based on basic salary.
   * Deducts 5.5% employee SSNIT first to find chargeable income, then applies progressive bands.
   */
  calculatePaye(basicSalary: number): PayeBreakdown {
    const ssnitDeduction = basicSalary * this.rules.paye.employeeSsnitRate;
    const chargeableIncome = basicSalary - ssnitDeduction;
    let remainingIncome = chargeableIncome;
    let totalTax = 0;
    const bracketsUsed = [];

    for (const band of this.rules.paye.monthlyBands) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(remainingIncome, band.limit);
      const taxInBracket = taxableInBracket * band.rate;

      if (taxableInBracket > 0) {
        totalTax += taxInBracket;
        bracketsUsed.push({
          rate: band.rate * 100,
          taxableInBracket: Math.round(taxableInBracket * 100) / 100,
          taxInBracket: Math.round(taxInBracket * 100) / 100,
        });
      }

      remainingIncome -= taxableInBracket;
    }

    const ssnitDeductionRounded = Math.round(ssnitDeduction * 100) / 100;
    const taxOwedRounded = Math.round(totalTax * 100) / 100;
    const basicSalaryRounded = Math.round(basicSalary * 100) / 100;
    const chargeableIncomeRounded = Math.round(chargeableIncome * 100) / 100;

    return {
      basicSalary: basicSalaryRounded,
      ssnitDeduction: ssnitDeductionRounded,
      chargeableIncome: chargeableIncomeRounded,
      taxOwed: taxOwedRounded,
      netSalary: Math.round((basicSalaryRounded - ssnitDeductionRounded - taxOwedRounded) * 100) / 100,
      bracketsUsed,
    };
  }

  /**
   * Calculates standard VAT on a single transaction.
   * Total effective rate: 20% (15% standard VAT + 2.5% GETFund + 2.5% NHIL).
   * Applicable only if the business is VAT-registered.
   */
  calculateVat(amount: number, isVatRegistered: boolean): number {
    return this.vatService.calculateVat(amount, isVatRegistered);
  }

  /**
   * Aggregates VAT reports inside the orchestrated TaxService.
   */
  calculateVATReport(transactions: Transaction[], startDate?: string, endDate?: string): VatReport {
    return this.vatService.calculateVATReport(transactions, startDate, endDate);
  }

  /**
   * Calculates Withholding Tax (WHT) for a transaction based on its category/type.
   * Resident WHT rates:
   * - Goods: 3% (e.g., supplies of office stationeries, raw goods)
   * - Works: 5% (e.g., construction, maintenance works)
   * - Services: 7.5% (e.g., consulting, legal, professional service, rent)
   */
  calculateWht(amount: number, category: string): number {
    const cat = category.toLowerCase();
    let rate = 0;

    if (cat.includes('goods') || cat.includes('supply') || cat.includes('product') || cat.includes('material')) {
      rate = this.rules.withholdingTax.goodsRate;
    } else if (cat.includes('work') || cat.includes('repair') || cat.includes('construction') || cat.includes('maintenance')) {
      rate = this.rules.withholdingTax.worksRate;
    } else if (
      cat.includes('service') ||
      cat.includes('consult') ||
      cat.includes('professional') ||
      cat.includes('rent') ||
      cat.includes('agency') ||
      cat.includes('legal') ||
      cat.includes('audit')
    ) {
      rate = this.rules.withholdingTax.servicesRate;
    }

    return Math.round(amount * rate * 100) / 100;
  }
}
