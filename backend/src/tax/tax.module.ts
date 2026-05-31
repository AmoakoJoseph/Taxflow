import { Module } from '@nestjs/common';
import { TaxService } from './tax.service';
import { VatService } from './vat.service';
import { TaxController } from './tax.controller';

@Module({
  controllers: [TaxController],
  providers: [TaxService, VatService],
  exports: [TaxService, VatService],
})
export class TaxModule {}
