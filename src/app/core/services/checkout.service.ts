import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CheckoutRepository } from '../repositories/checkout.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { CheckoutSession, CheckoutItem, PartReturn } from '../models/checkout.model';
import { StockLevel } from '../models/inventory.model';
import { ToastService } from './toast.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private checkoutRepo = inject(CheckoutRepository);
  private inventoryRepo = inject(InventoryRepository);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  async createCheckoutSession(technicianId: string, items: CheckoutItem[]): Promise<CheckoutSession> {
    try {
      // Validate stock availability
      for (const item of items) {
        const stock = await this.inventoryRepo.getStockByPart(item.partId).toPromise();
        const warehouseStock = stock?.find(s => s.locationId === 'warehouse'); // Assuming warehouse ID

        if (!warehouseStock || warehouseStock.availableQuantity < item.quantityCheckedOut) {
          throw new Error(`Insufficient stock for part ${item.partId}`);
        }
      }

      // Create checkout session
      const session: CheckoutSession = {
        id: crypto.randomUUID(),
        technicianId,
        fromLocationId: 'warehouse',
        toLocationId: `tech-${technicianId}`,
        status: 'ACTIVE',
        items: items.map(item => ({
          ...item,
          quantityUsed: 0,
          quantityReturned: 0,
          quantityDamaged: 0,
          status: 'CHECKED_OUT'
        })),
        checkoutDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = await this.checkoutRepo.createCheckoutSession(session);

      // Reserve stock
      for (const item of items) {
        // This would update reserved quantity in stock levels
        // Implementation depends on your stock management logic
      }

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'CHECKOUT',
        entityId: created.id,
        action: 'CREATE',
        payload: created,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Parts checked out successfully');
      return created;
    } catch (error) {
      this.toastService.error('Failed to checkout parts');
      throw error;
    }
  }

  getActiveCheckouts(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutRepo.getActiveCheckouts(technicianId);
  }

  getCheckoutHistory(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutRepo.getCheckoutHistory(technicianId);
  }

  async markPartAsUsed(sessionId: string, partId: string, quantity: number): Promise<void> {
    try {
      const sessions = await this.checkoutRepo.checkoutSessions$.toPromise();
      const session = sessions?.find(s => s.id === sessionId);

      if (!session) {
        throw new Error('Checkout session not found');
      }

      const item = session.items.find(i => i.partId === partId);
      if (!item) {
        throw new Error('Part not found in checkout session');
      }

      if (item.quantityCheckedOut - item.quantityUsed < quantity) {
        throw new Error('Insufficient quantity checked out');
      }

      // Update item
      item.quantityUsed += quantity;
      if (item.quantityUsed === item.quantityCheckedOut) {
        item.status = 'FULLY_USED';
      } else if (item.quantityUsed > 0) {
        item.status = 'PARTIALLY_USED';
      }

      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        items: session.items,
        updatedAt: new Date().toISOString()
      });

      this.toastService.success('Part usage recorded');
    } catch (error) {
      this.toastService.error('Failed to record part usage');
      throw error;
    }
  }

  async returnParts(sessionId: string, returns: PartReturn[]): Promise<void> {
    try {
      const sessions = await this.checkoutRepo.checkoutSessions$.toPromise();
      const session = sessions?.find(s => s.id === sessionId);

      if (!session) {
        throw new Error('Checkout session not found');
      }

      // Update items with return information
      for (const returnItem of returns) {
        const item = session.items.find(i => i.partId === returnItem.partId);
        if (item) {
          item.quantityReturned = returnItem.quantityReturned;
          item.quantityDamaged = returnItem.quantityDamaged;
          item.status = 'RETURNED';
        }
      }

      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        items: session.items,
        updatedAt: new Date().toISOString()
      });

      // Transfer stock back to warehouse
      // Implementation depends on your stock management logic

      this.toastService.success('Parts returned successfully');
    } catch (error) {
      this.toastService.error('Failed to return parts');
      throw error;
    }
  }

  async completeCheckoutSession(sessionId: string): Promise<void> {
    try {
      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        status: 'COMPLETED',
        actualReturnDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.toastService.success('Checkout session completed');
    } catch (error) {
      this.toastService.error('Failed to complete checkout session');
      throw error;
    }
  }

  getTechnicianInventory(technicianId: string): Observable<StockLevel[]> {
    const techLocationId = `tech-${technicianId}`;
    return this.inventoryRepo.getStockByLocation(techLocationId);
  }

  getPartsNeedingReturn(technicianId: string): Observable<CheckoutItem[]> {
    return this.getActiveCheckouts(technicianId).pipe(
      map(sessions => {
        const items: CheckoutItem[] = [];
        sessions.forEach(session => {
          session.items.forEach(item => {
            const unusedQty = item.quantityCheckedOut - item.quantityUsed - item.quantityReturned;
            if (unusedQty > 0) {
              items.push(item);
            }
          });
        });
        return items;
      })
    );
  }
}
