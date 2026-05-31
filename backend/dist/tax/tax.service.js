"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaxService = void 0;
const common_1 = require("@nestjs/common");
let TaxService = class TaxService {
    MONTHLY_BANDS = [
        { limit: 490, rate: 0 },
        { limit: 110, rate: 0.05 },
        { limit: 130, rate: 0.10 },
        { limit: 3166.67, rate: 0.175 },
        { limit: 16000, rate: 0.25 },
        { limit: 30520, rate: 0.30 },
        { limit: Infinity, rate: 0.35 },
    ];
    calculatePaye(basicSalary) {
        const ssnitDeduction = basicSalary * 0.055;
        const chargeableIncome = basicSalary - ssnitDeduction;
        let remainingIncome = chargeableIncome;
        let totalTax = 0;
        const bracketsUsed = [];
        for (const band of this.MONTHLY_BANDS) {
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
        if (!isVatRegistered)
            return 0;
        return Math.round(amount * 0.20 * 100) / 100;
    }
    calculateWht(amount, category) {
        const cat = category.toLowerCase();
        let rate = 0;
        if (cat.includes('goods') || cat.includes('supply') || cat.includes('product') || cat.includes('material')) {
            rate = 0.03;
        }
        else if (cat.includes('work') || cat.includes('repair') || cat.includes('construction') || cat.includes('maintenance')) {
            rate = 0.05;
        }
        else if (cat.includes('service') ||
            cat.includes('consult') ||
            cat.includes('professional') ||
            cat.includes('rent') ||
            cat.includes('agency') ||
            cat.includes('legal') ||
            cat.includes('audit')) {
            rate = 0.075;
        }
        return Math.round(amount * rate * 100) / 100;
    }
};
exports.TaxService = TaxService;
exports.TaxService = TaxService = __decorate([
    (0, common_1.Injectable)()
], TaxService);
//# sourceMappingURL=tax.service.js.map