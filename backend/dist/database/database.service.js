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
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
let DatabaseService = class DatabaseService {
    dbDirectory;
    dbFilePath;
    constructor() {
        if (process.env.VERCEL) {
            this.dbDirectory = os.tmpdir();
            this.dbFilePath = path.join(this.dbDirectory, 'taxflow_db.json');
        }
        else {
            this.dbDirectory = path.join(__dirname, '..', '..', 'data');
            this.dbFilePath = path.join(this.dbDirectory, 'db.json');
        }
    }
    data = {
        users: [],
        transactions: [],
        notifications: [],
    };
    onModuleInit() {
        this.ensureDbExists();
        this.loadData();
    }
    ensureDbExists() {
        try {
            if (!fs.existsSync(this.dbDirectory)) {
                fs.mkdirSync(this.dbDirectory, { recursive: true });
            }
        }
        catch (error) {
            console.warn('Warning: Could not create db directory:', error);
        }
        if (!fs.existsSync(this.dbFilePath)) {
            const seedFilePath = path.join(__dirname, '..', '..', 'data', 'db.json');
            let seeded = false;
            if (fs.existsSync(seedFilePath)) {
                try {
                    const seedData = fs.readFileSync(seedFilePath, 'utf8');
                    fs.writeFileSync(this.dbFilePath, seedData, 'utf8');
                    seeded = true;
                    console.log(`Database seeded successfully from ${seedFilePath} to ${this.dbFilePath}`);
                }
                catch (err) {
                    console.error('Failed to copy seed database file:', err);
                }
            }
            if (!seeded) {
                this.saveData();
            }
        }
    }
    loadData() {
        try {
            const rawData = fs.readFileSync(this.dbFilePath, 'utf8');
            this.data = JSON.parse(rawData);
            this.data.users = this.data.users || [];
            this.data.transactions = this.data.transactions || [];
            this.data.notifications = this.data.notifications || [];
        }
        catch (error) {
            console.error('Error loading database, creating a fresh one', error);
            this.data = { users: [], transactions: [], notifications: [] };
            this.saveData();
        }
    }
    saveData() {
        try {
            fs.writeFileSync(this.dbFilePath, JSON.stringify(this.data, null, 2), 'utf8');
        }
        catch (error) {
            console.error('Error saving data to database file', error);
        }
    }
    getUsers() {
        this.loadData();
        return this.data.users;
    }
    getUserById(id) {
        this.loadData();
        return this.data.users.find(u => u.id === id);
    }
    getUserByEmail(email) {
        this.loadData();
        return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }
    createUser(user) {
        this.loadData();
        this.data.users.push(user);
        this.saveData();
        return user;
    }
    updateUser(id, updates) {
        this.loadData();
        const index = this.data.users.findIndex(u => u.id === id);
        if (index === -1) {
            throw new Error(`User with ID ${id} not found`);
        }
        this.data.users[index] = { ...this.data.users[index], ...updates };
        this.saveData();
        return this.data.users[index];
    }
    getTransactions(userId) {
        this.loadData();
        return this.data.transactions.filter(t => t.userId === userId);
    }
    getTransactionById(id) {
        this.loadData();
        return this.data.transactions.find(t => t.id === id);
    }
    createTransaction(transaction) {
        this.loadData();
        this.data.transactions.push(transaction);
        this.saveData();
        return transaction;
    }
    updateTransaction(id, updates) {
        this.loadData();
        const index = this.data.transactions.findIndex(t => t.id === id);
        if (index === -1) {
            throw new Error(`Transaction with ID ${id} not found`);
        }
        this.data.transactions[index] = { ...this.data.transactions[index], ...updates };
        this.saveData();
        return this.data.transactions[index];
    }
    deleteTransaction(id) {
        this.loadData();
        const initialLength = this.data.transactions.length;
        this.data.transactions = this.data.transactions.filter(t => t.id !== id);
        const deleted = this.data.transactions.length < initialLength;
        if (deleted) {
            this.saveData();
        }
        return deleted;
    }
    getNotifications(userId) {
        this.loadData();
        return this.data.notifications.filter(n => n.userId === userId);
    }
    createNotification(notification) {
        this.loadData();
        this.data.notifications.push(notification);
        this.saveData();
        return notification;
    }
    markNotificationAsRead(id, userId) {
        this.loadData();
        const notification = this.data.notifications.find(n => n.id === id && n.userId === userId);
        if (notification) {
            notification.read = true;
            this.saveData();
            return true;
        }
        return false;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], DatabaseService);
//# sourceMappingURL=database.service.js.map