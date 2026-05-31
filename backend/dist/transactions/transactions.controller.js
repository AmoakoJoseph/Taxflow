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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionsController = void 0;
const common_1 = require("@nestjs/common");
const transactions_service_1 = require("./transactions.service");
const transaction_dto_1 = require("./transaction.dto");
let TransactionsController = class TransactionsController {
    transactionsService;
    constructor(transactionsService) {
        this.transactionsService = transactionsService;
    }
    extractUserId(authHeader) {
        if (!authHeader || !authHeader.startsWith('Bearer taxflow-session-')) {
            throw new common_1.UnauthorizedException('Please login to access this resource');
        }
        return authHeader.replace('Bearer taxflow-session-', '');
    }
    getTransactions(authHeader) {
        const userId = this.extractUserId(authHeader);
        return this.transactionsService.getTransactions(userId);
    }
    createTransaction(authHeader, body) {
        const userId = this.extractUserId(authHeader);
        return this.transactionsService.createTransaction(userId, body);
    }
    updateTransaction(authHeader, id, body) {
        const userId = this.extractUserId(authHeader);
        return this.transactionsService.updateTransaction(userId, id, body);
    }
    deleteTransaction(authHeader, id) {
        const userId = this.extractUserId(authHeader);
        const success = this.transactionsService.deleteTransaction(userId, id);
        return { success };
    }
};
exports.TransactionsController = TransactionsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Body)(transaction_dto_1.CreateTransactionPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "createTransaction", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)(transaction_dto_1.UpdateTransactionPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "updateTransaction", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Headers)('authorization')),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], TransactionsController.prototype, "deleteTransaction", null);
exports.TransactionsController = TransactionsController = __decorate([
    (0, common_1.Controller)('api/transactions'),
    __metadata("design:paramtypes", [transactions_service_1.TransactionsService])
], TransactionsController);
//# sourceMappingURL=transactions.controller.js.map