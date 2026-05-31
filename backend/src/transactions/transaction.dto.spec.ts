import { BadRequestException } from '@nestjs/common';
import { CreateTransactionPipe, UpdateTransactionPipe } from './transaction.dto';

describe('Transaction DTO validation pipes', () => {
  describe('CreateTransactionPipe', () => {
    const pipe = new CreateTransactionPipe();

    it('normalizes a valid transaction body', () => {
      expect(
        pipe.transform({
          type: 'income',
          amount: '1250.456',
          category: ' Services ',
          date: '2026-05-31',
          description: ' Client invoice ',
        })
      ).toEqual({
        type: 'income',
        amount: 1250.46,
        category: 'Services',
        date: '2026-05-31',
        description: 'Client invoice',
      });
    });

    it('rejects unsupported transaction types', () => {
      expect(() =>
        pipe.transform({
          type: 'transfer',
          amount: 100,
          category: 'Services',
          date: '2026-05-31',
          description: 'Invalid type',
        })
      ).toThrow(BadRequestException);
    });

    it('rejects invalid calendar dates', () => {
      expect(() =>
        pipe.transform({
          type: 'expense',
          amount: 100,
          category: 'Services',
          date: '2026-02-30',
          description: 'Impossible date',
        })
      ).toThrow(BadRequestException);
    });
  });

  describe('UpdateTransactionPipe', () => {
    const pipe = new UpdateTransactionPipe();

    it('rejects empty update bodies', () => {
      expect(() => pipe.transform({})).toThrow(BadRequestException);
    });
  });
});
