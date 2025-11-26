import { db } from '../firebaseConfig';
import { collection, addDoc, query, where, getDocs, Timestamp, QueryConstraint } from 'firebase/firestore';

export interface AuditLog {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  dataType: 'discount' | 'points' | 'user' | 'system' | 'report';
  resourceId: string;
  resourceName: string;
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  status: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  duration: number;
}

export interface AuditSummary {
  totalActions: number;
  successCount: number;
  failureCount: number;
  actionsByType: Record<string, number>;
  actionsByAdmin: Record<string, number>;
  topActions: Array<{ action: string; count: number }>;
  topAdmins: Array<{ admin: string; count: number }>;
  failureRate: number;
}

export interface ComplianceReport {
  generatedAt: Date;
  dateRange: { start: Date; end: Date };
  totalActions: number;
  dataModifications: number;
  deletions: number;
  exports: number;
  adminsInvolved: string[];
  criticalActions: AuditLog[];
  complianceStatus: 'compliant' | 'warning' | 'violation';
  recommendations: string[];
}

class AuditService {
  private logs: Map<string, AuditLog> = new Map();

  /**
   * Log admin action
   */
  async logAction(
    adminId: string,
    adminEmail: string,
    action: string,
    dataType: AuditLog['dataType'],
    resourceId: string,
    resourceName: string,
    changes: AuditLog['changes'],
    status: 'success' | 'failure' = 'success',
    errorMessage?: string,
    duration: number = 0
  ): Promise<AuditLog> {
    const logId = `audit_${Date.now()}`;
    const log: AuditLog = {
      id: logId,
      adminId,
      adminEmail,
      action,
      dataType,
      resourceId,
      resourceName,
      changes,
      status,
      errorMessage,
      ipAddress: this.getClientIp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: new Date(),
      duration,
    };

    this.logs.set(logId, log);

    try {
      await this.saveToFirebase(log);
    } catch (error) {
      console.error('Failed to save audit log:', error);
    }

    return log;
  }

  /**
   * Get audit logs with filters
   */
  getAuditLogs(filters?: {
    adminId?: string;
    dataType?: AuditLog['dataType'];
    action?: string;
    status?: 'success' | 'failure';
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }): AuditLog[] {
    let logs = Array.from(this.logs.values());

    if (filters?.adminId) {
      logs = logs.filter((l) => l.adminId === filters.adminId);
    }

    if (filters?.dataType) {
      logs = logs.filter((l) => l.dataType === filters.dataType);
    }

    if (filters?.action) {
      logs = logs.filter((l) => l.action === filters.action);
    }

    if (filters?.status) {
      logs = logs.filter((l) => l.status === filters.status);
    }

    if (filters?.startDate) {
      logs = logs.filter((l) => l.timestamp >= filters.startDate!);
    }

    if (filters?.endDate) {
      logs = logs.filter((l) => l.timestamp <= filters.endDate!);
    }

    logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (filters?.limit) {
      logs = logs.slice(0, filters.limit);
    }

    return logs;
  }

  /**
   * Get audit summary
   */
  getAuditSummary(startDate?: Date, endDate?: Date): AuditSummary {
    const logs = this.getAuditLogs({ startDate, endDate });

    const successCount = logs.filter((l) => l.status === 'success').length;
    const failureCount = logs.filter((l) => l.status === 'failure').length;

    const actionsByType: Record<string, number> = {};
    const actionsByAdmin: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    const adminCounts: Record<string, number> = {};

    for (const log of logs) {
      actionsByType[log.dataType] = (actionsByType[log.dataType] || 0) + 1;
      actionsByAdmin[log.adminEmail] = (actionsByAdmin[log.adminEmail] || 0) + 1;
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      adminCounts[log.adminEmail] = (adminCounts[log.adminEmail] || 0) + 1;
    }

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topAdmins = Object.entries(adminCounts)
      .map(([admin, count]) => ({ admin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions: logs.length,
      successCount,
      failureCount,
      actionsByType,
      actionsByAdmin,
      topActions,
      topAdmins,
      failureRate: logs.length > 0 ? (failureCount / logs.length) * 100 : 0,
    };
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const logs = this.getAuditLogs({ startDate, endDate });

    const dataModifications = logs.filter(
      (l) => l.action === 'update' || l.action === 'create'
    ).length;
    const deletions = logs.filter((l) => l.action === 'delete').length;
    const exports = logs.filter((l) => l.action === 'export').length;

    const adminsSet = new Set(logs.map((l) => l.adminEmail));
    const adminsInvolved = Array.from(adminsSet);

    const criticalActions = logs.filter(
      (l) => l.action === 'delete' || (l.action === 'update' && l.dataType === 'user')
    );

    const failureRate = logs.length > 0
      ? (logs.filter((l) => l.status === 'failure').length / logs.length) * 100
      : 0;

    let complianceStatus: 'compliant' | 'warning' | 'violation' = 'compliant';
    const recommendations: string[] = [];

    if (failureRate > 5) {
      complianceStatus = 'warning';
      recommendations.push('High failure rate detected. Review error logs.');
    }

    if (deletions > 100) {
      complianceStatus = 'warning';
      recommendations.push('Large number of deletions. Verify data retention policies.');
    }

    if (criticalActions.length > 50) {
      complianceStatus = 'warning';
      recommendations.push('Many critical actions. Review admin permissions.');
    }

    if (!logs.some((l) => l.action === 'export')) {
      recommendations.push('No data exports recorded. Consider regular backups.');
    }

    return {
      generatedAt: new Date(),
      dateRange: { start: startDate, end: endDate },
      totalActions: logs.length,
      dataModifications,
      deletions,
      exports,
      adminsInvolved,
      criticalActions,
      complianceStatus,
      recommendations,
    };
  }

  /**
   * Export audit logs to CSV
   */
  exportToCSV(filters?: Parameters<typeof this.getAuditLogs>[0]): string {
    const logs = this.getAuditLogs(filters);

    const headers = [
      'Timestamp',
      'Admin',
      'Action',
      'Data Type',
      'Resource',
      'Status',
      'Duration (ms)',
    ];

    const rows = logs.map((log) => [
      log.timestamp.toISOString(),
      log.adminEmail,
      log.action,
      log.dataType,
      log.resourceName,
      log.status,
      log.duration,
    ]);

    return [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
  }

  /**
   * Export audit logs to JSON
   */
  exportToJSON(filters?: Parameters<typeof this.getAuditLogs>[0]): string {
    const logs = this.getAuditLogs(filters);
    return JSON.stringify(logs, null, 2);
  }

  /**
   * Get user data for GDPR export
   */
  async getUserDataExport(userId: string): Promise<AuditLog[]> {
    return this.getAuditLogs({ adminId: userId });
  }

  /**
   * Delete user data for GDPR compliance
   */
  async deleteUserData(userId: string): Promise<number> {
    const userLogs = this.getAuditLogs({ adminId: userId });
    let deleted = 0;

    for (const log of userLogs) {
      if (this.logs.delete(log.id)) {
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Get data retention status
   */
  getDataRetentionStatus(retentionDays: number = 90): {
    totalLogs: number;
    logsToDelete: number;
    oldestLog: Date | null;
    newestLog: Date | null;
  } {
    const logs = Array.from(this.logs.values());
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const logsToDelete = logs.filter((l) => l.timestamp < cutoffDate).length;

    const dates = logs.map((l) => l.timestamp.getTime());
    const oldestLog = dates.length > 0 ? new Date(Math.min(...dates)) : null;
    const newestLog = dates.length > 0 ? new Date(Math.max(...dates)) : null;

    return {
      totalLogs: logs.length,
      logsToDelete,
      oldestLog,
      newestLog,
    };
  }

  /**
   * Cleanup old logs
   */
  cleanupOldLogs(retentionDays: number = 90): number {
    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
    let deleted = 0;

    for (const [id, log] of this.logs.entries()) {
      if (log.timestamp < cutoffDate) {
        this.logs.delete(id);
        deleted++;
      }
    }

    return deleted;
  }

  /**
   * Private: Save to Firebase
   */
  private async saveToFirebase(log: AuditLog): Promise<void> {
    try {
      const logsRef = collection(db, 'auditLogs');
      await addDoc(logsRef, {
        ...log,
        timestamp: Timestamp.fromDate(log.timestamp),
      });
    } catch (error) {
      console.error('Failed to save to Firebase:', error);
    }
  }

  /**
   * Private: Get client IP
   */
  private getClientIp(): string {
    if (typeof window === 'undefined') return 'unknown';
    return (window as any).clientIp || 'unknown';
  }
}

export const auditService = new AuditService();
