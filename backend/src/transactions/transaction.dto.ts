import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { TransactionType } from '../tax/tax.constants';

const TRANSACTION_TYPES: TransactionType[] = ['income', 'expense', 'payroll'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface CreateTransactionDto {
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface UpdateTransactionDto {
  type?: TransactionType;
  amount?: number;
  category?: string;
  date?: string;
  description?: string;
}

type RawTransactionBody = Record<string, unknown>;

@Injectable()
export class CreateTransactionPipe implements PipeTransform {
  transform(value: RawTransactionBody): CreateTransactionDto {
    const body = ensureObject(value);
    return {
      type: validateType(body.type, 'type'),
      amount: validateAmount(body.amount, 'amount'),
      category: validateText(body.category, 'category'),
      date: validateDate(body.date, 'date'),
      description: validateText(body.description, 'description'),
    };
  }
}

@Injectable()
export class UpdateTransactionPipe implements PipeTransform {
  transform(value: RawTransactionBody): UpdateTransactionDto {
    const body = ensureObject(value);
    const dto: UpdateTransactionDto = {};

    if ('type' in body) dto.type = validateType(body.type, 'type');
    if ('amount' in body) dto.amount = validateAmount(body.amount, 'amount');
    if ('category' in body) dto.category = validateText(body.category, 'category');
    if ('date' in body) dto.date = validateDate(body.date, 'date');
    if ('description' in body) dto.description = validateText(body.description, 'description');

    if (Object.keys(dto).length === 0) {
      throw new BadRequestException('At least one transaction field must be provided');
    }

    return dto;
  }
}

function ensureObject(value: unknown): RawTransactionBody {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Request body must be an object');
  }
  return value as RawTransactionBody;
}

function validateType(value: unknown, field: string): TransactionType {
  if (typeof value !== 'string' || !TRANSACTION_TYPES.includes(value as TransactionType)) {
    throw new BadRequestException(`${field} must be one of: ${TRANSACTION_TYPES.join(', ')}`);
  }
  return value as TransactionType;
}

function validateAmount(value: unknown, field: string): number {
  const amount = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestException(`${field} must be a positive number`);
  }
  return Math.round(amount * 100) / 100;
}

function validateText(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new BadRequestException(`${field} is required`);
  }
  return value.trim();
}

function validateDate(value: unknown, field: string): string {
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new BadRequestException(`${field} must use YYYY-MM-DD format`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} must be a valid calendar date`);
  }

  return value;
}
