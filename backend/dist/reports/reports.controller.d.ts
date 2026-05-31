import { ReportsService } from './reports.service';
import type { TaxSummaryQueryDto } from './report-query.dto';
export declare class ReportsController {
    private readonly reportsService;
    constructor(reportsService: ReportsService);
    private extractUserId;
    getTaxSummary(authHeader: string | undefined, query: TaxSummaryQueryDto): import("./reports.service").TaxSummary;
    getNotifications(authHeader?: string): import("../database/database.service").Notification[];
    readNotification(authHeader: string | undefined, id: string): {
        success: boolean;
    };
}
