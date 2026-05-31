import { DatabaseService, User } from '../database/database.service';
export declare class AuthService {
    private readonly db;
    constructor(db: DatabaseService);
    private hashPassword;
    register(email: string, password: string, businessName: string, tin: string, vatRegistered: boolean, industryType: string): Omit<User, 'passwordHash'>;
    login(email: string, password: string): {
        user: Omit<User, 'passwordHash'>;
        token: string;
    };
    getProfile(userId: string): Omit<User, 'passwordHash'>;
    updateProfile(userId: string, updates: {
        businessName?: string;
        tin?: string;
        vatRegistered?: boolean;
        industryType?: string;
    }): Omit<User, 'passwordHash'>;
}
