import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest } from 'rxjs';
import { UsageRepository } from '../repositories/usage.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { CheckoutRepository } from '../repositories/checkout.repository';
import { PartUsage, SerializedPart, SerializedPartInstallation, DateRange } from '../models/usage.model';
import { ToastService } from './toast.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class UsageTrackingService {
  private usageRepo = inject(UsageRepository);
  private inventoryRepo = inject(InventoryRepository);
  private checkoutRepo = inject(CheckoutRepository);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  async recordPartUsage(usage: Omit<PartUsage, 'id' | 'timestamp'>): Promise<PartUsage> {
    try {
      const partUsage: PartUsage = {
        ...usage,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      const created = await this.usageRepo.createPartUsage(partUsage);

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'PART_USAGE',
        entityId: created.id,
        action: 'CREATE',
        payload: created,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Part usage recorded successfully');
      return created;
    } catch (error) {
      this.toastService.error('Failed to record part usage');
      throw error;
    }
  }

  getWorkOrderUsage(workOrderId: string): Observable<PartUsage[]> {
    return this.usageRepo.getWorkOrderUsage(workOrderId);
  }

  getTechnicianUsage(technicianId: string, dateRange?: DateRange): Observable<PartUsage[]> {
    return this.usageRepo.getTechnicianUsage(technicianId).pipe(
      map(usage => {
        if (!dateRange) return usage;

        return usage.filter(u => {
          const usageDate = new Date(u.timestamp);
          return usageDate >= dateRange.startDate && usageDate <= dateRange.endDate;
        });
      })
    );
  }

  getPartUsageHistory(partId: string): Observable<PartUsage[]> {
    return this.usageRepo.partUsage$.pipe(
      map(usage => usage.filter(u => u.partId === partId))
    );
  }

  async recordSerializedPartInstallation(installation: SerializedPartInstallation): Promise<void> {
    try {
      // Calculate warranty expiration
      const warrantyExpiration = new Date(installation.installationDate);
      warrantyExpiration.setMonth(warrantyExpiration.getMonth() + installation.warrantyMonths);

      // Record the usage with serialized part info
      await this.recordPartUsage({
        workOrderId: installation.workOrderId,
        partId: installation.partId,
        technicianId: '', // Will be set from context
        checkoutSessionId: '', // Will be set from context
        quantity: 1,
        serialNumber: installation.serialNumber,
        reason: 'Installation',
        customerApproved: false,
        installationDate: installation.installationDate.toISOString(),
        warrantyExpirationDate: warrantyExpiration.toISOString(),
        notes: installation.notes
      });

      this.toastService.success('Serialized part installation recorded');
    } catch (error) {
      this.toastService.error('Failed to record installation');
      throw error;
    }
  }

  getSerializedPartHistory(serialNumber: string): Observable<PartUsage[]> {
    return this.usageRepo.partUsage$.pipe(
      map(usage => usage.filter(u => u.serialNumber === serialNumber))
    );
  }

  getPartsUnderWarranty(): Observable<PartUsage[]> {
    return this.usageRepo.partUsage$.pipe(
      map(usage => {
        const now = new Date();
        return usage.filter(u => {
          if (!u.warrantyExpirationDate) return false;
          const expirationDate = new Date(u.warrantyExpirationDate);
          return expirationDate > now;
        });
      })
    );
  }

  getExpiringWarranties(daysThreshold: number = 30): Observable<PartUsage[]> {
    return this.usageRepo.partUsage$.pipe(
      map(usage => {
        const now = new Date();
        const thresholdDate = new Date();
        thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

        return usage.filter(u => {
          if (!u.warrantyExpirationDate) return false;
          const expirationDate = new Date(u.warrantyExpirationDate);
          return expirationDate > now && expirationDate <= thresholdDate;
        });
      })
    );
  }

  async updatePartUsage(id: string, updates: Partial<PartUsage>): Promise<void> {
    try {
      const usage = await this.usageRepo.partUsage$.toPromise();
      const existing = usage?.find(u => u.id === id);

      if (!existing) {
        throw new Error('Part usage record not found');
      }

      const updated = { ...existing, ...updates };

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'PART_USAGE',
        entityId: id,
        action: 'UPDATE',
        payload: updated,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Part usage updated');
    } catch (error) {
      this.toastService.error('Failed to update part usage');
      throw error;
    }
  }

  getUsageSummary(technicianId?: string, dateRange?: DateRange): Observable<{
    totalPartsUsed: number;
    totalCost: number;
    uniqueParts: number;
    workOrdersWithParts: number;
  }> {
    let usage$ = this.usageRepo.partUsage$;

    if (technicianId) {
      usage$ = this.getTechnicianUsage(technicianId, dateRange);
    }

    return combineLatest([usage$, this.inventoryRepo.parts$]).pipe(
      map(([usage, parts]) => {
        const uniquePartIds = new Set(usage.map(u => u.partId));
        const uniqueWorkOrders = new Set(usage.map(u => u.workOrderId));

        const totalCost = usage.reduce((sum, u) => {
          const part = parts.find(p => p.id === u.partId);
          return sum + (part ? part.unitCost * u.quantity : 0);
        }, 0);

        const totalPartsUsed = usage.reduce((sum, u) => sum + u.quantity, 0);

        return {
          totalPartsUsed,
          totalCost,
          uniqueParts: uniquePartIds.size,
          workOrdersWithParts: uniqueWorkOrders.size
        };
      })
    );
  }
}
