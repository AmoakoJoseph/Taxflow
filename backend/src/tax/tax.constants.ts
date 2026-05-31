export const GHANA_TAX_RULES_2026 = {
  vat: {
    standardRate: 0.15,
    nhilRate: 0.025,
    getFundRate: 0.025,
    get combinedRate() {
      return this.standardRate + this.nhilRate + this.getFundRate;
    },
  },
  paye: {
    employeeSsnitRate: 0.055,
    monthlyBands: [
      { limit: 490, rate: 0 },
      { limit: 110, rate: 0.05 },
      { limit: 130, rate: 0.1 },
      { limit: 3166.67, rate: 0.175 },
      { limit: 16000, rate: 0.25 },
      { limit: 30520, rate: 0.3 },
      { limit: Infinity, rate: 0.35 },
    ],
  },
  withholdingTax: {
    goodsRate: 0.03,
    worksRate: 0.05,
    servicesRate: 0.075,
  },
  filingDeadlines: {
    payeAndWhtDayOfMonth: 15,
    vatDueLabel: 'the last working day of the following month',
    reminderWindowDays: 15,
  },
} as const;

export type TransactionType = 'income' | 'expense' | 'payroll';
