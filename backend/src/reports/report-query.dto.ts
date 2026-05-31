import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export interface TaxSummaryQueryDto {
  startDate?: string;
  endDate?: string;
}

@Injectable()
export class TaxSummaryQueryPipe implements PipeTransform {
  transform(value: Record<string, unknown>): TaxSummaryQueryDto {
    const startDate = validateOptionalDate(value?.startDate, 'startDate');
    const endDate = validateOptionalDate(value?.endDate, 'endDate');

    if (startDate && endDate && startDate > endDate) {
      throw new BadRequestException('startDate must be before or equal to endDate');
    }

    return { startDate, endDate };
  }
}

function validateOptionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !DATE_PATTERN.test(value)) {
    throw new BadRequestException(`${field} must use YYYY-MM-DD format`);
  }

  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
    throw new BadRequestException(`${field} must be a valid calendar date`);
  }

  return value;
}
