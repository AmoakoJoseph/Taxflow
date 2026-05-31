import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { DatabaseService, User } from '../database/database.service';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly db: DatabaseService) {}

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async register(email: string, password: string, businessName: string, tin: string, vatRegistered: boolean, industryType: string): Promise<Omit<User, 'passwordHash'>> {
    const existing = this.db.getUserByEmail(email);
    if (existing) {
      throw new BadRequestException('A business with this email is already registered');
    }

    const id = crypto.randomUUID();
    const passwordHash = await this.hashPassword(password);

    const newUser: User = {
      id,
      email,
      passwordHash,
      businessName,
      tin,
      vatRegistered,
      industryType,
    };

    this.db.createUser(newUser);

    // Create a first notification welcome message
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

  async login(email: string, password: string): Promise<{ user: Omit<User, 'passwordHash'>; token: string }> {
    const user = this.db.getUserByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { passwordHash: _, ...userWithoutHash } = user;
    // We will return a simple token which represents user.id for simplicity
    return {
      user: userWithoutHash,
      token: `taxflow-session-${user.id}`,
    };
  }

  getProfile(userId: string): Omit<User, 'passwordHash'> {
    const user = this.db.getUserById(userId);
    if (!user) {
      throw new UnauthorizedException('User session not found');
    }
    const { passwordHash: _, ...result } = user;
    return result;
  }

  updateProfile(userId: string, updates: { businessName?: string; tin?: string; vatRegistered?: boolean; industryType?: string }): Omit<User, 'passwordHash'> {
    const updated = this.db.updateUser(userId, updates);
    const { passwordHash: _, ...result } = updated;
    return result;
  }
}
