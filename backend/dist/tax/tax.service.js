"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
const tax_constants_1 = require("./tax.constants");
const vat_service_1 = require("./vat.service");
let TaxService = class TaxService {
    vatService;
    rules = tax_constants_1.GHANA_TAX_RULES_2026;
    constructor(vatService) {
        this.vatService = vatService;
    }
    calculatePaye(basicSalary) {
        const ssnitDeduction = basicSalary * this.rules.paye.employeeSsnitRate;
        const chargeableIncome = basicSalary - ssnitDeduction;
        let remainingIncome = chargeableIncome;
        let totalTax = 0;
        const bracketsUsed = [];
        for (const band of this.rules.paye.monthlyBands) {
            if (remainingIncome <= 0)
                break;
            const taxableInBracket = Math.min(remainingIncome, band.limit);
            const taxInBracket = taxableInBracket * band.rate;
            if (taxableInBracket > 0) {
                totalTax += taxInBracket;
                bracketsUsed.push({
                    rate: band.rate * 100,
                    taxableInBracket: Math.round(taxableInBracket * 100) / 100,
                    taxInBracket: Math.round(taxInBracket * 100) / 100,
                });
            }
            remainingIncome -= taxableInBracket;
        }
        const ssnitDeductionRounded = Math.round(ssnitDeduction * 100) / 100;
        const taxOwedRounded = Math.round(totalTax * 100) / 100;
        const basicSalaryRounded = Math.round(basicSalary * 100) / 100;
        const chargeableIncomeRounded = Math.round(chargeableIncome * 100) / 100;
        return {
            basicSalary: basicSalaryRounded,
            ssnitDeduction: ssnitDeductionRounded,
            chargeableIncome: chargeableIncomeRounded,
            taxOwed: taxOwedRounded,
            netSalary: Math.round((basicSalaryRounded - ssnitDeductionRounded - taxOwedRounded) * 100) / 100,
            bracketsUsed,
        };
    }
    calculateVat(amount, isVatRegistered) {
        return this.vatService.calculateVat(amount, isVatRegistered);
    }
    calculateVATReport(transactions, startDate, endDate) {
        return this.vatService.calculateVATReport(transactions, startDate, endDate);
    }
    calculateWht(amount, category) {
        const cat = category.toLowerCase();
        let rate = 0;
        if (cat.includes('goods') || cat.includes('supply') || cat.includes('product') || cat.includes('material')) {
            rate = this.rules.withholdingTax.goodsRate;
        }
        else if (cat.includes('work') || cat.includes('repair') || cat.includes('construction') || cat.includes('maintenance')) {
            rate = this.rules.withholdingTax.worksRate;
        }
        else if (cat.includes('service') ||
            cat.includes('consult') ||
            cat.includes('professional') ||
            cat.includes('rent') ||
            cat.includes('agency') ||
            cat.includes('legal') ||
            cat.includes('audit')) {
            rate = this.rules.withholdingTax.servicesRate;
        }
        return Math.round(amount * rate * 100) / 100;
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [vat_service_1.VatService])
], TaxService);
//# sourceMappingURL=tax.service.js.map