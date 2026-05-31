import { DatabaseService, Transaction } from '../database/database.service';
import { TaxService } from '../tax/tax.service';
export declare class TransactionsService {
    private readonly db;
    private readonly taxService;
    constructor(db: DatabaseService, taxService: TaxService);
    private verifyUser;
    getTransactions(userId: string): Transaction[];
    createTransaction(userId: string, data: {
        type: 'income' | 'expense' | 'payroll';
        amount: number;
        category: string;
        date: string;
        description: string;
    }): Transaction;
    updateTransaction(userId: string, id: string, updates: {
        type?: 'income' | 'expense' | 'payroll';
        amount?: number;
        category?: string;
        date?: string;
        description?: string;
    }): Transaction;
    deleteTransaction(userId: string, id: string): boolean;
}
