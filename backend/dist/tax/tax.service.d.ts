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
export declare class TaxService {
    private readonly MONTHLY_BANDS;
    calculatePaye(basicSalary: number): PayeBreakdown;
    calculateVat(amount: number, isVatRegistered: boolean): number;
    calculateWht(amount: number, category: string): number;
}
