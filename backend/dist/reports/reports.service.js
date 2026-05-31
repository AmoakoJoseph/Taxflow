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
exports.ReportsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ReportsService = class ReportsService {
    db;
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
            totalIncome: Math.round(totalIncome * 100) / 100,
            totalExpense: Math.round(totalExpense * 100) / 100,
            totalPayroll: Math.round(totalPayroll * 100) / 100,
            netProfit: Math.round((totalIncome - totalExpense - totalPayroll) * 100) / 100,
            vatBreakdown: {
                outputVat: Math.round(outputVat * 100) / 100,
                inputVat: Math.round(inputVat * 100) / 100,
                vatPayable: Math.round(vatPayable * 100) / 100,
            },
            payeBreakdown: {
                totalPaye: Math.round(totalPaye * 100) / 100,
            },
            whtBreakdown: {
                whtSuffered: Math.round(whtSuffered * 100) / 100,
                whtWithheld: Math.round(whtWithheld * 100) / 100,
                netWhtBalance: Math.round((whtWithheld - whtSuffered) * 100) / 100,
            },
            totalEstimatedTaxOwed: Math.round(totalEstimatedTaxOwed * 100) / 100,
        };
    }
    getNotifications(userId) {
        this.verifyUser(userId);
        const today = new Date();
        const currentDay = today.getDate();
        const nextMonthName = new Date(today.getFullYear(), today.getMonth() + 1, 1).toLocaleString('en-US', { month: 'long' });
        const userNotifications = this.db.getNotifications(userId);
        const deadlineDay = 15;
        const daysRemaining = deadlineDay - currentDay;
        if (daysRemaining > 0 && daysRemaining <= 15) {
            const reminderTitle = 'Filing Deadline Approaching ⏳';
            const exists = userNotifications.some(n => n.title === reminderTitle && !n.read);
            if (!exists) {
                this.db.createNotification({
                    id: Math.random().toString(36).substring(2),
                    userId,
                    type: 'warning',
                    title: reminderTitle,
                    message: `GRA filing deadline is coming up on the 15th of ${nextMonthName}. Ensure all VAT, PAYE, and Withholding taxes are finalized.`,
                    date: today.toISOString().split('T')[0],
                    read: false,
                });
            }
        }
        return this.db.getNotifications(userId).sort((a, b) => b.date.localeCompare(a.date));
    }
    readNotification(userId, id) {
        this.verifyUser(userId);
        return this.db.markNotificationAsRead(id);
    }
};
exports.ReportsService = ReportsService;
exports.ReportsService = ReportsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ReportsService);
//# sourceMappingURL=reports.service.js.map