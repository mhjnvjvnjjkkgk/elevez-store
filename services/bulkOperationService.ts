// Bulk Operation Service
// Handles bulk user operations with progress tracking

import { getFirestore, collection, writeBatch, doc, getDoc } from 'firebase/firestore';
import { adminUserManagementService } from './adminUserManagementService';

export interface BulkOperation {
  id: string;
  type: 'update_points' | 'change_tier' | 'create_discount';
  totalItems: number;
  processedItems: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt: string;
  completedAt?: string;
  error?: string;
}

class BulkOperationService {
  private db = getFirestore();
  private operations = new Map<string, BulkOperation>();

  /**
   * Bulk update user points
   */
  async bulkUpdatePoints(
    updates: Array<{ userId: string; points: number; reason?: string }>,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; operationId: string; error?: string }> {
    try {
      const operationId = `bulk_points_${Date.now()}`;
      const operation: BulkOperation = {
        id: operationId,
        type: 'update_points',
        totalItems: updates.length,
        processedItems: 0,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
      };

      this.operations.set(operationId, operation);

      const batch = writeBatch(this.db);
      let processed = 0;

      for (const update of updates) {
        const userRef = doc(this.db, 'users', update.userId);
        batch.update(userRef, {
          points: update.points,
          updatedAt: new Date().toISOString(),
        });

        processed++;
        operation.processedItems = processed;
        operation.progress = (processed / updates.length) * 100;

        if (onProgress) {
          onProgress(operation.progress);
        }
      }

      await batch.commit();

      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();
      this.operations.set(operationId, operation);

      return { success: true, operationId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, operationId: '', error: errorMessage };
    }
  }

  /**
   * Bulk change user tier
   */
  async bulkChangeTier(
    updates: Array<{ userId: string; tier: string; reason?: string }>,
    onProgress?: (progress: number) => void
  ): Promise<{ success: boolean; operationId: string; error?: string }> {
    try {
      const operationId = `bulk_tier_${Date.now()}`;
      const operation: BulkOperation = {
        id: operationId,
        type: 'change_tier',
        totalItems: updates.length,
        processedItems: 0,
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
      };

      this.operations.set(operationId, operation);

      const batch = writeBatch(this.db);
      let processed = 0;

      for (const update of updates) {
        const userRef = doc(this.db, 'users', update.userId);
        batch.update(userRef, {
          tier: update.tier,
          updatedAt: new Date().toISOString(),
        });

        processed++;
        operation.processedItems = processed;
        operation.progress = (processed / updates.length) * 100;

        if (onProgress) {
          onProgress(operation.progress);
        }
      }

      await batch.commit();

      operation.status = 'completed';
      operation.completedAt = new Date().toISOString();
      this.operations.set(operationId, operation);

      return { success: true, operationId };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, operationId: '', error: errorMessage };
    }
  }

  /**
   * Get operation status
   */
  getOperationStatus(operationId: string): BulkOperation | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Get all operations
   */
  getAllOperations(): BulkOperation[] {
    return Array.from(this.operations.values());
  }
}

export const bulkOperationService = new BulkOperationService();
