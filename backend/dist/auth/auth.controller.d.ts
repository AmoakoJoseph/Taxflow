import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    private extractUserId;
    register(body: {
        email: string;
        password?: string;
        businessName: string;
        tin: string;
        vatRegistered: boolean;
        industryType: string;
    }): Promise<Omit<import("../database/database.service").User, "passwordHash">>;
    login(body: {
        email: string;
        password?: string;
    }): Promise<{
        user: Omit<import("../database/database.service").User, "passwordHash">;
        token: string;
    }>;
    getProfile(authHeader?: string): Omit<import("../database/database.service").User, "passwordHash">;
    updateProfile(authHeader: string | undefined, body: {
        businessName?: string;
        tin?: string;
        vatRegistered?: boolean;
        industryType?: string;
    }): Omit<import("../database/database.service").User, "passwordHash">;
}
