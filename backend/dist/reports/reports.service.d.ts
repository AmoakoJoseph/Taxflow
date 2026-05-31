import { DatabaseService, Notification } from '../database/database.service';
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
export declare class ReportsService {
    private readonly db;
    private readonly rules;
    constructor(db: DatabaseService);
    private verifyUser;
    getTaxSummary(userId: string, startDate?: string, endDate?: string): TaxSummary;
    getNotifications(userId: string): Notification[];
    readNotification(userId: string, id: string): boolean;
}
