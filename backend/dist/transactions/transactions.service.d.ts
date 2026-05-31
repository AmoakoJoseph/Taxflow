import { DatabaseService, Transaction } from '../database/database.service';
import { TaxService } from '../tax/tax.service';
import { CreateTransactionDto, UpdateTransactionDto } from './transaction.dto';
export declare class TransactionsService {
    private readonly db;
    private readonly taxService;
    constructor(db: DatabaseService, taxService: TaxService);
    private verifyUser;
    getTransactions(userId: string): Transaction[];
    createTransaction(userId: string, data: CreateTransactionDto): Transaction;
    updateTransaction(userId: string, id: string, updates: UpdateTransactionDto): Transaction;
    deleteTransaction(userId: string, id: string): boolean;
}
