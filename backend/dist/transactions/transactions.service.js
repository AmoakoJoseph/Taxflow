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
exports.TransactionsService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const tax_service_1 = require("../tax/tax.service");
const crypto = __importStar(require("crypto"));
let TransactionsService = class TransactionsService {
    db;
    taxService;
    constructor(db, taxService) {
        this.db = db;
        this.taxService = taxService;
    }
    verifyUser(userId) {
        const user = this.db.getUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User session not found');
        }
        return user;
    }
    getTransactions(userId) {
        this.verifyUser(userId);
        return this.db.getTransactions(userId).sort((a, b) => b.date.localeCompare(a.date));
    }
    createTransaction(userId, data) {
        const user = this.verifyUser(userId);
        const id = crypto.randomUUID();
        let vatAmount = 0;
        let payeAmount = 0;
        let whtAmount = 0;
        if (data.type === 'income') {
            vatAmount = this.taxService.calculateVat(data.amount, user.vatRegistered);
            whtAmount = this.taxService.calculateWht(data.amount, data.category);
        }
        else if (data.type === 'expense') {
            vatAmount = this.taxService.calculateVat(data.amount, user.vatRegistered);
            whtAmount = this.taxService.calculateWht(data.amount, data.category);
        }
        else if (data.type === 'payroll') {
            const payeCalculations = this.taxService.calculatePaye(data.amount);
            payeAmount = payeCalculations.taxOwed;
        }
        const transaction = {
            id,
            userId,
            type: data.type,
            amount: data.amount,
            category: data.category,
            date: data.date,
            description: data.description,
            vatAmount,
            payeAmount,
            whtAmount,
        };
        return this.db.createTransaction(transaction);
    }
    updateTransaction(userId, id, updates) {
        const user = this.verifyUser(userId);
        const existing = this.db.getTransactionById(id);
        if (!existing || existing.userId !== userId) {
            throw new common_1.NotFoundException(`Transaction not found`);
        }
        const merged = { ...existing, ...updates };
        let vatAmount = 0;
        let payeAmount = 0;
        let whtAmount = 0;
        if (merged.type === 'income') {
            vatAmount = this.taxService.calculateVat(merged.amount, user.vatRegistered);
            whtAmount = this.taxService.calculateWht(merged.amount, merged.category);
        }
        else if (merged.type === 'expense') {
            vatAmount = this.taxService.calculateVat(merged.amount, user.vatRegistered);
            whtAmount = this.taxService.calculateWht(merged.amount, merged.category);
        }
        else if (merged.type === 'payroll') {
            const payeCalculations = this.taxService.calculatePaye(merged.amount);
            payeAmount = payeCalculations.taxOwed;
        }
        return this.db.updateTransaction(id, {
            type: merged.type,
            amount: merged.amount,
            category: merged.category,
            date: merged.date,
            description: merged.description,
            vatAmount,
            payeAmount,
            whtAmount,
        });
    }
    deleteTransaction(userId, id) {
        this.verifyUser(userId);
        const existing = this.db.getTransactionById(id);
        if (!existing || existing.userId !== userId) {
            throw new common_1.NotFoundException(`Transaction not found`);
        }
        return this.db.deleteTransaction(id);
    }
};
exports.TransactionsService = TransactionsService;
exports.TransactionsService = TransactionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService,
        tax_service_1.TaxService])
], TransactionsService);
//# sourceMappingURL=transactions.service.js.map