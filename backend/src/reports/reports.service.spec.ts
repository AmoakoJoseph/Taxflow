import { ReportsService } from './reports.service';
import { DatabaseService, Notification, Transaction, User } from '../database/database.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let db: jest.Mocked<Pick<DatabaseService, 'getUserById' | 'getTransactions' | 'getNotifications' | 'createNotification' | 'markNotificationAsRead'>>;

  const user: User = {
    id: 'user-1',
    email: 'owner@example.com',
    passwordHash: 'hash',
    businessName: 'Demo Business',
    tin: 'GHA-DEMO',
    vatRegistered: true,
    industryType: 'Services',
  };

  beforeEach(() => {
    db = {
      getUserById: jest.fn().mockReturnValue(user),
      getTransactions: jest.fn(),
      getNotifications: jest.fn().mockReturnValue([]),
      createNotification: jest.fn(),
      markNotificationAsRead: jest.fn(),
    };
    service = new ReportsService(db as unknown as DatabaseService);
  });

  it('summarizes VAT, PAYE, WHT, and profit totals', () => {
    const transactions: Transaction[] = [
      {
        id: 'income-1',
        userId: 'user-1',
        type: 'income',
        amount: 5000,
        category: 'Goods',
        date: '2026-05-10',
        description: 'Sales',
        vatAmount: 1000,
        payeAmount: 0,
        whtAmount: 150,
      },
      {
        id: 'expense-1',
        userId: 'user-1',
        type: 'expense',
        amount: 1200,
        category: 'Services',
        date: '2026-05-12',
        description: 'Accounting',
        vatAmount: 240,
        payeAmount: 0,
        whtAmount: 90,
      },
      {
        id: 'payroll-1',
        userId: 'user-1',
        type: 'payroll',
        amount: 2500,
        category: 'Salaries',
        date: '2026-05-25',
        description: 'Salary',
        vatAmount: 0,
        payeAmount: 304.19,
        whtAmount: 0,
      },
    ];
    db.getTransactions.mockReturnValue(transactions);

    expect(service.getTaxSummary('user-1')).toMatchObject({
      totalIncome: 5000,
      totalExpense: 1200,
      totalPayroll: 2500,
      netProfit: 1300,
      vatBreakdown: {
        outputVat: 1000,
        inputVat: 240,
        vatPayable: 760,
      },
      payeBreakdown: {
        totalPaye: 304.19,
      },
      whtBreakdown: {
        whtSuffered: 150,
        whtWithheld: 90,
        netWhtBalance: -60,
      },
      totalEstimatedTaxOwed: 1154.19,
    });
  });

  it('marks notifications as read using the authenticated user id', () => {
    db.markNotificationAsRead.mockReturnValue(true);

    expect(service.readNotification('user-1', 'notice-1')).toBe(true);
    expect(db.markNotificationAsRead).toHaveBeenCalledWith('notice-1', 'user-1');
  });

  it('sorts notifications newest first', () => {
    const notifications: Notification[] = [
      {
        id: 'old',
        userId: 'user-1',
        type: 'info',
        title: 'Old',
        message: 'Old notice',
        date: '2026-05-01',
        read: false,
      },
      {
        id: 'new',
        userId: 'user-1',
        type: 'warning',
        title: 'New',
        message: 'New notice',
        date: '2026-05-31',
        read: false,
      },
    ];
    db.getNotifications.mockReturnValue(notifications);

    expect(service.getNotifications('user-1').map(n => n.id)).toEqual(['new', 'old']);
  });
});
