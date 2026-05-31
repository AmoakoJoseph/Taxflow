import { Test, TestingModule } from '@nestjs/testing';
import { VatService } from './vat.service';
import { Transaction } from '../database/database.service';

describe('VatService', () => {
  let service: VatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VatService],
    }).compile();

    service = module.get<VatService>(VatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateVat (Extraction)', () => {
    it('should correctly extract 20% VAT from a VAT-inclusive amount of 120 GHS', () => {
      // 120 - (120 / 1.20) = 120 - 100 = 20
      const vat = service.calculateVat(120, true);
      expect(vat).toBe(20);
    });

    it('should correctly extract VAT from inclusive amount of 60 GHS (expect 10 GHS)', () => {
      // 60 - (60 / 1.20) = 60 - 50 = 10
      const vat = service.calculateVat(60, true);
      expect(vat).toBe(10);
    });

    it('should return 0 if the business is not VAT registered', () => {
      const vat = service.calculateVat(120, false);
      expect(vat).toBe(0);
    });

    it('should return 0 if the transaction amount is 0 or negative', () => {
      expect(service.calculateVat(0, true)).toBe(0);
      expect(service.calculateVat(-100, true)).toBe(0);
    });

    it('should round the extracted VAT to 2 decimal places', () => {
      // 100 GHS inclusive: 100 - (100 / 1.2) = 100 - 83.3333... = 16.6666... -> rounds to 16.67
      const vat = service.calculateVat(100, true);
      expect(vat).toBe(16.67);
    });
  });

  describe('calculateVATReport (Aggregation Pipeline)', () => {
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        userId: 'user-1',
        type: 'income',
        amount: 120,
        category: 'Services',
        date: '2026-05-01',
        description: 'Consulting sales',
        vatAmount: 20, // extracted from 120
        payeAmount: 0,
        whtAmount: 0,
      },
      {
        id: '2',
        userId: 'user-1',
        type: 'income',
        amount: 60,
        category: 'Goods',
        date: '2026-05-15',
        description: 'Goods sales',
        vatAmount: 10, // extracted from 60
        payeAmount: 0,
        whtAmount: 0,
      },
      {
        id: '3',
        userId: 'user-1',
        type: 'expense',
        amount: 30,
        category: 'Goods',
        date: '2026-05-20',
        description: 'Office paper purchases',
        vatAmount: 5, // extracted from 30
        payeAmount: 0,
        whtAmount: 0,
      },
      {
        id: '4',
        userId: 'user-1',
        type: 'expense',
        amount: 120,
        category: 'Services',
        date: '2026-06-10', // OUTSIDE May range
        description: 'Agency retainer fee',
        vatAmount: 20,
        payeAmount: 0,
        whtAmount: 0,
      },
      {
        id: '5',
        userId: 'user-1',
        type: 'payroll',
        amount: 1000,
        category: 'Salaries',
        date: '2026-05-28',
        description: 'Staff payroll',
        vatAmount: 0, // payroll doesn't carry VAT
        payeAmount: 100,
        whtAmount: 0,
      }
    ];

    it('should aggregate mixed income/expense transactions within a date range correctly', () => {
      // In May 2026:
      // Incomes: tx 1 (20 VAT), tx 2 (10 VAT). Total outputVAT = 30
      // Expenses: tx 3 (5 VAT). Total inputVAT = 5
      // Net payableVAT = 30 - 5 = 25
      const report = service.calculateVATReport(mockTransactions, '2026-05-01', '2026-05-31');
      
      expect(report.outputVAT).toBe(30);
      expect(report.inputVAT).toBe(5);
      expect(report.payableVAT).toBe(25);
    });

    it('should return all zeros if transactions array is empty', () => {
      const report = service.calculateVATReport([], '2026-05-01', '2026-05-31');
      expect(report).toEqual({
        outputVAT: 0,
        inputVAT: 0,
        payableVAT: 0,
      });
    });

    it('should calculate only output VAT if there are only income transactions', () => {
      const incomesOnly = mockTransactions.filter(t => t.type === 'income');
      const report = service.calculateVATReport(incomesOnly, '2026-05-01', '2026-06-30');
      
      expect(report.outputVAT).toBe(30);
      expect(report.inputVAT).toBe(0);
      expect(report.payableVAT).toBe(30);
    });

    it('should calculate negative payable VAT if there are only expense transactions', () => {
      const expensesOnly = mockTransactions.filter(t => t.type === 'expense');
      const report = service.calculateVATReport(expensesOnly, '2026-05-01', '2026-06-30');
      
      expect(report.outputVAT).toBe(0);
      expect(report.inputVAT).toBe(25); // May (5) + June (20)
      expect(report.payableVAT).toBe(-25);
    });

    it('should correctly filter transactions on boundary dates', () => {
      // Boundary test: exactly May 15 to May 20
      // Includes: tx 2 (income, 10 VAT, May 15) & tx 3 (expense, 5 VAT, May 20)
      // Net payable = 10 - 5 = 5
      const report = service.calculateVATReport(mockTransactions, '2026-05-15', '2026-05-20');
      
      expect(report.outputVAT).toBe(10);
      expect(report.inputVAT).toBe(5);
      expect(report.payableVAT).toBe(5);
    });
  });
});
