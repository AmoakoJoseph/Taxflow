import { Test, TestingModule } from '@nestjs/testing';
import { TaxService } from './tax.service';

describe('TaxService', () => {
  let service: TaxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaxService],
    }).compile();

    service = module.get<TaxService>(TaxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateVat', () => {
    it('should return 0 if the business is not VAT-registered', () => {
      const result = service.calculateVat(1000, false);
      expect(result).toBe(0);
    });

    it('should calculate 20% effective VAT if VAT-registered (15% standard + 5% GETFund/NHIL)', () => {
      const result = service.calculateVat(1000, true);
      expect(result).toBe(200); // 1000 * 0.20
    });

    it('should round VAT calculations to 2 decimal places', () => {
      const result = service.calculateVat(333.33, true);
      expect(result).toBe(66.67); // 333.33 * 0.2 = 66.666 -> rounds to 66.67
    });
  });

  describe('calculateWht', () => {
    it('should apply 3% WHT on goods supply', () => {
      const result = service.calculateWht(1000, 'Supply of Office Stationery');
      expect(result).toBe(30); // 3%
    });

    it('should apply 5% WHT on works or repairs', () => {
      const result = service.calculateWht(1000, 'Building Maintenance and Repairs');
      expect(result).toBe(50); // 5%
    });

    it('should apply 7.5% WHT on professional services or consulting', () => {
      const result = service.calculateWht(1000, 'Tax Consulting Services');
      expect(result).toBe(75); // 7.5%
    });

    it('should apply 0% WHT for unrecognized categories', () => {
      const result = service.calculateWht(1000, 'Other general expense');
      expect(result).toBe(0);
    });
  });

  describe('calculatePaye', () => {
    it('should calculate 0 tax for chargeable income under threshold (e.g. GHS 400 basic)', () => {
      const breakdown = service.calculatePaye(400);
      expect(breakdown.ssnitDeduction).toBe(22); // 400 * 5.5%
      expect(breakdown.chargeableIncome).toBe(378); // 400 - 22
      expect(breakdown.taxOwed).toBe(0); // 378 is under GHS 490 monthly free band
      expect(breakdown.netSalary).toBe(378);
    });

    it('should correctly calculate progressive PAYE for GHS 1,000 basic salary', () => {
      // Basic = 1,000
      // SSNIT = 55
      // Chargeable = 945
      // Progressive Band calculation:
      // Band 1: First 490 @ 0% = 0 tax
      // Band 2: Next 110 @ 5% = 5.5 tax
      // Band 3: Next 130 @ 10% = 13 tax
      // Band 4: Next 3,166.67 @ 17.5% -> remaining chargeable is 945 - (490+110+130) = 215.
      //         Remaining tax = 215 * 0.175 = 37.63 tax
      // Total tax = 0 + 5.5 + 13 + 37.63 = 56.13 tax
      const breakdown = service.calculatePaye(1000);
      expect(breakdown.ssnitDeduction).toBe(55);
      expect(breakdown.chargeableIncome).toBe(945);
      expect(breakdown.taxOwed).toBe(56.13); // 56.125 rounded
      expect(breakdown.netSalary).toBe(888.87); // 1000 - 55 - 56.13
    });

    it('should calculate correct high-tier brackets for GHS 10,000 basic salary', () => {
      // Basic = 10,000
      // SSNIT = 550
      // Chargeable = 9450
      // Progressive Band calculation:
      // Band 1: First 490 @ 0% = 0 tax
      // Band 2: Next 110 @ 5% = 5.5 tax
      // Band 3: Next 130 @ 10% = 13 tax
      // Band 4: Next 3,166.67 @ 17.5% = 554.17 tax
      // Band 5: Next 16,000 @ 25% -> remaining is 9450 - 3896.67 = 5553.33
      //         Remaining tax = 5553.33 * 0.25 = 1388.33 tax
      // Total tax = 0 + 5.5 + 13 + 554.17 + 1388.33 = 1961.00 tax (approx)
      const breakdown = service.calculatePaye(10000);
      expect(breakdown.ssnitDeduction).toBe(550);
      expect(breakdown.chargeableIncome).toBe(9450);
      expect(breakdown.taxOwed).toBeCloseTo(1961, 0);
    });
  });
});
