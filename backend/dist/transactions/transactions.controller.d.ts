import { TransactionsService } from './transactions.service';
import type { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
export declare class TransactionsController {
    private readonly transactionsService;
    constructor(transactionsService: TransactionsService);
    private extractUserId;
    getTransactions(authHeader?: string): import("../database/database.service").Transaction[];
    createTransaction(authHeader: string | undefined, body: CreateTransactionDto): import("../database/database.service").Transaction;
    updateTransaction(authHeader: string | undefined, id: string, body: UpdateTransactionDto): import("../database/database.service").Transaction;
    deleteTransaction(authHeader: string | undefined, id: string): {
        success: boolean;
    };
}
