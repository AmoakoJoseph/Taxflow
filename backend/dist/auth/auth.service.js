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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const crypto = __importStar(require("crypto"));
const bcrypt = __importStar(require("bcryptjs"));
let AuthService = class AuthService {
    db;
    constructor(db) {
        this.db = db;
    }
    async hashPassword(password) {
        return bcrypt.hash(password, 10);
    }
    async register(email, password, businessName, tin, vatRegistered, industryType) {
        const existing = this.db.getUserByEmail(email);
        if (existing) {
            throw new common_1.BadRequestException('A business with this email is already registered');
        }
        const id = crypto.randomUUID();
        const passwordHash = await this.hashPassword(password);
        const newUser = {
            id,
            email,
            passwordHash,
            businessName,
            tin,
            vatRegistered,
            industryType,
        };
        this.db.createUser(newUser);
        this.db.createNotification({
            id: crypto.randomUUID(),
            userId: id,
            type: 'info',
            title: 'Welcome to Taxflow! 🇬🇭',
            message: `Welcome, ${businessName}. Setup your business ledger to automatically calculate VAT, PAYE, and Withholding Taxes. Keep your TIN (${tin}) ready for filing.`,
            date: new Date().toISOString().split('T')[0],
            read: false,
        });
        const { passwordHash: _, ...result } = newUser;
        return result;
    }
    async login(email, password) {
        const user = this.db.getUserByEmail(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const { passwordHash: _, ...userWithoutHash } = user;
        return {
            user: userWithoutHash,
            token: `taxflow-session-${user.id}`,
        };
    }
    getProfile(userId) {
        const user = this.db.getUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User session not found');
        }
        const { passwordHash: _, ...result } = user;
        return result;
    }
    updateProfile(userId, updates) {
        const updated = this.db.updateUser(userId, updates);
        const { passwordHash: _, ...result } = updated;
        return result;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], AuthService);
//# sourceMappingURL=auth.service.js.map