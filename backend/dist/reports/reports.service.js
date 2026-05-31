"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const tax_constants_1 = require("../tax/tax.constants");
const crypto = __importStar(require("crypto"));
let ReportsService = class ReportsService {
    db;
    rules = tax_constants_1.GHANA_TAX_RULES_2026;
    constructor(db) {
        this.db = db;
    }
    verifyUser(userId) {
        const user = this.db.getUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User session not found');
        }
        return user;
    }
    getTaxSummary(userId, startDate, endDate) {
        const user = this.verifyUser(userId);
        let transactions = this.db.getTransactions(userId);
        if (startDate) {
            transactions = transactions.filter(t => t.date >= startDate);
        }
        if (endDate) {
            transactions = transactions.filter(t => t.date <= endDate);
        }
        let totalIncome = 0;
        let totalExpense = 0;
        let totalPayroll = 0;
        let outputVat = 0;
        let inputVat = 0;
        let totalPaye = 0;
        let whtSuffered = 0;
        let whtWithheld = 0;
        for (const t of transactions) {
            if (t.type === 'income') {
                totalIncome += t.amount;
                outputVat += t.vatAmount;
                whtSuffered += t.whtAmount;
            }
            else if (t.type === 'expense') {
                totalExpense += t.amount;
                inputVat += t.vatAmount;
                whtWithheld += t.whtAmount;
            }
            else if (t.type === 'payroll') {
                totalPayroll += t.amount;
                totalPaye += t.payeAmount;
            }
        }
        const vatPayable = user.vatRegistered ? Math.max(0, outputVat - inputVat) : 0;
        const totalEstimatedTaxOwed = vatPayable + totalPaye + whtWithheld;
        return {
            businessName: user.businessName,
            tin: user.tin,
            vatRegistered: user.vatRegistered,
            totalIncome: roundMoney(totalIncome),
            totalExpense: roundMoney(totalExpense),
            totalPayroll: roundMoney(totalPayroll),
            netProfit: roundMoney(totalIncome - totalExpense - totalPayroll),
            vatBreakdown: {
                outputVat: roundMoney(outputVat),
                inputVat: roundMoney(inputVat),
                vatPayable: roundMoney(vatPayable),
            },
            payeBreakdown: {
                totalPaye: roundMoney(totalPaye),
            },
            whtBreakdown: {
                whtSuffered: roundMoney(whtSuffered),
                whtWithheld: roundMoney(whtWithheld),
                netWhtBalance: roundMoney(whtWithheld - whtSuffered),
            },
            totalEstimatedTaxOwed: roundMoney(totalEstimatedTaxOwed),
        };
    }
    getNotifications(userId) {
        this.verifyUser(userId);
        const today = new Date();
        const currentDay = today.getDate();
        const nextMonthName = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', {
            month: 'long',
        });
        const userNotifications = this.db.getNotifications(userId);
        const deadlineDay = this.rules.filingDeadlines.payeAndWhtDayOfMonth;
        const daysRemaining = deadlineDay - currentDay;
        if (daysRemaining > 0 && daysRemaining <= this.rules.filingDeadlines.reminderWindowDays) {
            const reminderTitle = 'PAYE/WHT Filing Deadline Approaching';
            const exists = userNotifications.some(n => n.title === reminderTitle && !n.read);
            if (!exists) {
                this.db.createNotification({
                    id: crypto.randomUUID(),
                    userId,
                    type: 'warning',
                    title: reminderTitle,
                    message: `PAYE and Withholding Tax filings are due on the 15th of ${nextMonthName}. VAT/NHIL filings are due by ${this.rules.filingDeadlines.vatDueLabel}.`,
                    date: today.toISOString().split('T')[0],
                    read: false,
                });
            }
        }
        return this.db.getNotifications(userId).sort((a, b) => b.date.localeCompare(a.date));
    }
    readNotification(userId, id) {
        this.verifyUser(userId);
        return this.db.markNotificationAsRead(id, userId);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReportsService);
function roundMoney(amount) {
    return Math.round(amount * 100) / 100;
}
//# sourceMappingURL=reports.service.js.map