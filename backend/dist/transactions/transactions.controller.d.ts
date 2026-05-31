import { TransactionsService } from './transactions.service';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    private extractUserId;
    getTransactions(authHeader?: string): import("../database/database.service").Transaction[];
    createTransaction(authHeader: string | undefined, body: {
        type: 'income' | 'expense' | 'payroll';
        amount: number;
        category: string;
        date: string;
        description: string;
    }): import("../database/database.service").Transaction;
    updateTransaction(authHeader: string | undefined, id: string, body: {
        type?: 'income' | 'expense' | 'payroll';
        amount?: number;
        category?: string;
        date?: string;
        description?: string;
    }): import("../database/database.service").Transaction;
    deleteTransaction(authHeader: string | undefined, id: string): {
        success: boolean;
    };
}
