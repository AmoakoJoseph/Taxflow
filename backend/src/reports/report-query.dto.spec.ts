import { BadRequestException } from '@nestjs/common';
import { TaxSummaryQueryPipe } from './report-query.dto';

describe('TaxSummaryQueryPipe', () => {
  const pipe = new TaxSummaryQueryPipe();

  it('accepts an empty query', () => {
    expect(pipe.transform({})).toEqual({
      startDate: undefined,
      endDate: undefined,
    });
  });

  it('accepts a valid date range', () => {
    expect(pipe.transform({ startDate: '2026-05-01', endDate: '2026-05-31' })).toEqual({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
    });
  });

  it('rejects invalid date formats', () => {
    expect(() => pipe.transform({ startDate: '31-05-2026' })).toThrow(BadRequestException);
  });

  it('rejects an inverted date range', () => {
    expect(() => pipe.transform({ startDate: '2026-06-01', endDate: '2026-05-31' })).toThrow(
      BadRequestException
    );
  });
});
