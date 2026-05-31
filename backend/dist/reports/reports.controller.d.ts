import { ReportsService } from './reports.service';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    private extractUserId;
    getTaxSummary(authHeader: string | undefined, startDate?: string, endDate?: string): import("./reports.service").TaxSummary;
    getNotifications(authHeader?: string): import("../database/database.service").Notification[];
    readNotification(authHeader: string | undefined, id: string): {
        success: boolean;
    };
}
