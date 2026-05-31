import { OnModuleInit } from '@nestjs/common';
export interface User {
    id: string;
    email: string;
    passwordHash: string;
    businessName: string;
    tin: string;
    vatRegistered: boolean;
    industryType: string;
}
export interface Transaction {
    id: string;
    userId: string;
    type: 'income' | 'expense' | 'payroll';
    amount: number;
    category: string;
    date: string;
    description: string;
    vatAmount: number;
    payeAmount: number;
    whtAmount: number;
}
export interface Notification {
    id: string;
    userId: string;
    type: 'info' | 'warning' | 'alert';
    title: string;
    message: string;
    date: string;
    read: boolean;
}
export declare class DatabaseService implements OnModuleInit {
    private readonly dbDirectory;
    private readonly dbFilePath;
    private data;
    onModuleInit(): void;
    private ensureDbExists;
    private loadData;
    private saveData;
    getUsers(): User[];
    getUserById(id: string): User | undefined;
    getUserByEmail(email: string): User | undefined;
    createUser(user: User): User;
    updateUser(id: string, updates: Partial<Omit<User, 'id' | 'passwordHash'>>): User;
    getTransactions(userId: string): Transaction[];
    getTransactionById(id: string): Transaction | undefined;
    createTransaction(transaction: Transaction): Transaction;
    updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'userId'>>): Transaction;
    deleteTransaction(id: string): boolean;
    getNotifications(userId: string): Notification[];
    createNotification(notification: Notification): Notification;
    markNotificationAsRead(id: string, userId: string): boolean;
}
