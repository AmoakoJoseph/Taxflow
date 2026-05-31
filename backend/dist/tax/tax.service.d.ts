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
export declare class TaxService {
    private readonly vatService;
    private readonly rules;
    constructor(vatService: VatService);
    calculatePaye(basicSalary: number): PayeBreakdown;
    calculateVat(amount: number, isVatRegistered: boolean): number;
    calculateVATReport(transactions: Transaction[], startDate?: string, endDate?: string): VatReport;
    calculateWht(amount: number, category: string): number;
}
