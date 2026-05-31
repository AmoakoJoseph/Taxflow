import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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
  date: string; // YYYY-MM-DD
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

interface DbSchema {
  users: User[];
  transactions: Transaction[];
  notifications: Notification[];
}

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly dbDirectory = path.join(__dirname, '..', '..', 'data');
  private readonly dbFilePath = path.join(this.dbDirectory, 'db.json');

  private data: DbSchema = {
    users: [],
    transactions: [],
    notifications: [],
  };

  onModuleInit() {
    this.ensureDbExists();
    this.loadData();
  }

  private ensureDbExists() {
    if (!fs.existsSync(this.dbDirectory)) {
      fs.mkdirSync(this.dbDirectory, { recursive: true });
    }
    if (!fs.existsSync(this.dbFilePath)) {
      this.saveData();
    }
  }

  private loadData() {
    try {
      const rawData = fs.readFileSync(this.dbFilePath, 'utf8');
      this.data = JSON.parse(rawData);
      // Ensure arrays are present
      this.data.users = this.data.users || [];
      this.data.transactions = this.data.transactions || [];
      this.data.notifications = this.data.notifications || [];
    } catch (error) {
      console.error('Error loading database, creating a fresh one', error);
      this.data = { users: [], transactions: [], notifications: [] };
      this.saveData();
    }
  }

  private saveData() {
    try {
      fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (error) {
      console.error('Error saving data to database file', error);
    }
  }

  // Users CRUD
  getUsers(): User[] {
    this.loadData();
    return this.data.users;
  }

  getUserById(id: string): User | undefined {
    this.loadData();
    return this.data.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    this.loadData();
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.loadData();
    this.data.users.push(user);
    this.saveData();
    return user;
  }

  updateUser(id: string, updates: Partial<Omit<User, 'id' | 'passwordHash'>>): User {
    this.loadData();
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error(`User with ID ${id} not found`);
    }
    this.data.users[index] = { ...this.data.users[index], ...updates };
    this.saveData();
    return this.data.users[index];
  }

  // Transactions CRUD
  getTransactions(userId: string): Transaction[] {
    this.loadData();
    return this.data.transactions.filter(t => t.userId === userId);
  }

  getTransactionById(id: string): Transaction | undefined {
    this.loadData();
    return this.data.transactions.find(t => t.id === id);
  }

  createTransaction(transaction: Transaction): Transaction {
    this.loadData();
    this.data.transactions.push(transaction);
    this.saveData();
    return transaction;
  }

  updateTransaction(id: string, updates: Partial<Omit<Transaction, 'id' | 'userId'>>): Transaction {
    this.loadData();
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error(`Transaction with ID ${id} not found`);
    }
    this.data.transactions[index] = { ...this.data.transactions[index], ...updates };
    this.saveData();
    return this.data.transactions[index];
  }

  deleteTransaction(id: string): boolean {
    this.loadData();
    const initialLength = this.data.transactions.length;
    this.data.transactions = this.data.transactions.filter(t => t.id !== id);
    const deleted = this.data.transactions.length < initialLength;
    if (deleted) {
      this.saveData();
    }
    return deleted;
  }

  // Notifications CRUD
  getNotifications(userId: string): Notification[] {
    this.loadData();
    return this.data.notifications.filter(n => n.userId === userId);
  }

  createNotification(notification: Notification): Notification {
    this.loadData();
    this.data.notifications.push(notification);
    this.saveData();
    return notification;
  }

  markNotificationAsRead(id: string): boolean {
    this.loadData();
    const notification = this.data.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveData();
      return true;
    }
    return false;
  }
}
