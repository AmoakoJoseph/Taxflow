import { Injectable } from '@nestjs/common';

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
  // 2026 MONTHLY Resident PAYE brackets
  // Band 1: First 490 @ 0%
  // Band 2: Next 110 (up to 600) @ 5%
  // Band 3: Next 130 (up to 730) @ 10%
  // Band 4: Next 3,166.67 (up to 3,896.67) @ 17.5%
  // Band 5: Next 16,000 (up to 19,896.67) @ 25%
  // Band 6: Next 30,520 (up to 50,416.67) @ 30%
  // Band 7: Above 50,416.67 @ 35%
  private readonly MONTHLY_BANDS = [
    { limit: 490, rate: 0 },
    { limit: 110, rate: 0.05 },
    { limit: 130, rate: 0.10 },
    { limit: 3166.67, rate: 0.175 },
    { limit: 16000, rate: 0.25 },
    { limit: 30520, rate: 0.30 },
    { limit: Infinity, rate: 0.35 },
  ];

  /**
   * Calculates PAYE (income tax) for a resident employee based on basic salary.
   * Deducts 5.5% employee SSNIT first to find chargeable income, then applies progressive bands.
   */
  calculatePaye(basicSalary: number): PayeBreakdown {
    const ssnitDeduction = basicSalary * 0.055;
    const chargeableIncome = basicSalary - ssnitDeduction;
    let remainingIncome = chargeableIncome;
    let totalTax = 0;
    const bracketsUsed = [];

    for (const band of this.MONTHLY_BANDS) {
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
    if (!isVatRegistered) return 0;
    // Standard effective combined rate in 2026 is 20%
    return Math.round(amount * 0.20 * 100) / 100;
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
      rate = 0.03;
    } else if (cat.includes('work') || cat.includes('repair') || cat.includes('construction') || cat.includes('maintenance')) {
      rate = 0.05;
    } else if (
      cat.includes('service') ||
      cat.includes('consult') ||
      cat.includes('professional') ||
      cat.includes('rent') ||
      cat.includes('agency') ||
      cat.includes('legal') ||
      cat.includes('audit')
    ) {
      rate = 0.075;
    }

    return Math.round(amount * rate * 100) / 100;
  }
}
