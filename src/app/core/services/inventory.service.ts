import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest } from 'rxjs';
import { InventoryRepository } from '../repositories/inventory.repository';
import { Part, StockLevel, PartFilters, LowStockAlert } from '../models/inventory.model';
import { NetworkService } from './network.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryRepo = inject(InventoryRepository);
  private networkService = inject(NetworkService);
  private toastService = inject(ToastService);

  // Parts catalog management
  getParts(): Observable<Part[]> {
    return this.inventoryRepo.parts$;
  }

  getPartById(id: string): Observable<Part | undefined> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => parts.find(p => p.id === id))
    );
  }

  searchParts(query: string, filters?: PartFilters): Observable<Part[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        let filtered = parts;

        // Text search
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(lowerQuery) ||
            p.partNumber.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        }

        // Apply filters
        if (filters) {
          if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
          }
          if (filters.subcategory) {
            filtered = filtered.filter(p => p.subcategory === filters.subcategory);
          }
          if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(p =>
              filters.tags!.some(tag => p.tags.includes(tag))
            );
          }
          if (filters.equipmentId) {
            filtered = filtered.filter(p =>
              p.equipmentCompatibility.includes(filters.equipmentId!)
            );
          }
          if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice >= filters.minPrice!);
          }
          if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice <= filters.maxPrice!);
          }
        }

        return filtered;
      })
    );
  }

  async createPart(part: Part): Promise<Part> {
    try {
      const created = await this.inventoryRepo.createPart(part);
      this.toastService.success('Part created successfully');
      return created;
    } catch (error) {
      this.toastService.error('Failed to create part');
      throw error;
    }
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    try {
      const updated = await this.inventoryRepo.updatePart(id, updates);
      this.toastService.success('Part updated successfully');
      return updated;
    } catch (error) {
      this.toastService.error('Failed to update part');
      throw error;
    }
  }

  async deletePart(id: string): Promise<void> {
    try {
      await this.inventoryRepo.deletePart(id);
      this.toastService.success('Part deleted successfully');
    } catch (error) {
      this.toastService.error('Failed to delete part');
      throw error;
    }
  }

  // Stock management
  getStockLevels(locationId?: string): Observable<StockLevel[]> {
    if (locationId) {
      return this.inventoryRepo.getStockByLocation(locationId);
    }
    return this.inventoryRepo.stockLevels$;
  }

  getStockByPart(partId: string): Observable<StockLevel[]> {
    return this.inventoryRepo.getStockByPart(partId);
  }

  async adjustStock(partId: string, locationId: string, quantity: number, reason: string): Promise<void> {
    try {
      await this.inventoryRepo.updateStockLevel(partId, locationId, quantity);
      this.toastService.success('Stock adjusted successfully');
    } catch (error) {
      this.toastService.error('Failed to adjust stock');
      throw error;
    }
  }

  async transferStock(partId: string, fromLocationId: string, toLocationId: string, quantity: number): Promise<void> {
    try {
      // Get current stock levels
      const fromStock = await this.inventoryRepo.getStockByLocation(fromLocationId).toPromise();
      const toStock = await this.inventoryRepo.getStockByLocation(toLocationId).toPromise();

      const fromLevel = fromStock?.find(s => s.partId === partId);
      const toLevel = toStock?.find(s => s.partId === partId);

      if (!fromLevel || fromLevel.availableQuantity < quantity) {
        throw new Error('Insufficient stock at source location');
      }

      // Decrease from source
      await this.inventoryRepo.updateStockLevel(partId, fromLocationId, fromLevel.quantity - quantity);

      // Increase at destination
      const newToQuantity = (toLevel?.quantity || 0) + quantity;
      await this.inventoryRepo.updateStockLevel(partId, toLocationId, newToQuantity);

      this.toastService.success('Stock transferred successfully');
    } catch (error) {
      this.toastService.error('Failed to transfer stock');
      throw error;
    }
  }

  // Low stock alerts
  getLowStockParts(): Observable<Part[]> {
    return combineLatest([
      this.inventoryRepo.parts$,
      this.inventoryRepo.stockLevels$
    ]).pipe(
      map(([parts, stockLevels]) => {
        return parts.filter(part => {
          const partStock = stockLevels.filter(s => s.partId === part.id);
          const totalStock = partStock.reduce((sum, s) => sum + s.availableQuantity, 0);
          return totalStock < part.minStockLevel;
        });
      })
    );
  }

  async checkLowStockAlerts(): Promise<LowStockAlert[]> {
    const parts = await this.inventoryRepo.parts$.toPromise();
    const stockLevels = await this.inventoryRepo.stockLevels$.toPromise();
    const locations = await this.inventoryRepo.locations$.toPromise();

    const alerts: LowStockAlert[] = [];

    parts?.forEach(part => {
      const partStock = stockLevels?.filter(s => s.partId === part.id) || [];

      partStock.forEach(stock => {
        if (stock.availableQuantity < part.minStockLevel) {
          const location = locations?.find(l => l.id === stock.locationId);
          const severity = stock.availableQuantity === 0 ? 'CRITICAL' : 'WARNING';

          alerts.push({
            part,
            currentStock: stock.availableQuantity,
            minStockLevel: part.minStockLevel,
            locationId: stock.locationId,
            locationName: location?.name || 'Unknown',
            severity
          });
        }
      });
    });

    return alerts;
  }

  // Categories and tags
  getCategories(): Observable<string[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        const categories = new Set(parts.map(p => p.category));
        return Array.from(categories).sort();
      })
    );
  }

  getTags(): Observable<string[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        const tags = new Set(parts.flatMap(p => p.tags));
        return Array.from(tags).sort();
      })
    );
  }

  getEquipmentCompatibility(partId: string): Observable<string[]> {
    return this.getPartById(partId).pipe(
      map(part => part?.equipmentCompatibility || [])
    );
  }
}
