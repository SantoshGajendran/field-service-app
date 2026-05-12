import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { Part, StockLocation, StockLevel } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly PARTS_KEY = 'inventory_parts';
  private readonly LOCATIONS_KEY = 'inventory_locations';
  private readonly STOCK_LEVELS_KEY = 'inventory_stock_levels';

  private partsSubject = new BehaviorSubject<Part[]>([]);
  private locationsSubject = new BehaviorSubject<StockLocation[]>([]);
  private stockLevelsSubject = new BehaviorSubject<StockLevel[]>([]);

  public parts$ = this.partsSubject.asObservable();
  public locations$ = this.locationsSubject.asObservable();
  public stockLevels$ = this.stockLevelsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    // Load from local storage first for instant UI
    const cachedParts = await this.storageService.getItem<Part[]>(this.PARTS_KEY);
    const cachedLocations = await this.storageService.getItem<StockLocation[]>(this.LOCATIONS_KEY);
    const cachedStockLevels = await this.storageService.getItem<StockLevel[]>(this.STOCK_LEVELS_KEY);

    if (cachedParts) this.partsSubject.next(cachedParts);
    if (cachedLocations) this.locationsSubject.next(cachedLocations);
    if (cachedStockLevels) this.stockLevelsSubject.next(cachedStockLevels);

    // Then sync with Supabase
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      // Sync parts
      this.supabase.getParts().subscribe({
        next: (parts: Part[]) => {
          this.partsSubject.next(parts);
          this.storageService.setItem(this.PARTS_KEY, parts);
        },
        error: (error: any) => console.error('Error syncing parts:', error)
      });

      // Sync locations
      this.supabase.getStockLocations().subscribe({
        next: (locations: StockLocation[]) => {
          this.locationsSubject.next(locations);
          this.storageService.setItem(this.LOCATIONS_KEY, locations);
        },
        error: (error: any) => console.error('Error syncing locations:', error)
      });

      // Sync stock levels
      this.supabase.getStockLevels().subscribe({
        next: (stockLevels: StockLevel[]) => {
          this.stockLevelsSubject.next(stockLevels);
          this.storageService.setItem(this.STOCK_LEVELS_KEY, stockLevels);
        },
        error: (error: any) => console.error('Error syncing stock levels:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  // Parts methods
  async createPart(part: Part): Promise<Part> {
    const created = await this.supabase.createPart(part);
    const current = this.partsSubject.getValue();
    const updated = [...current, created];
    this.partsSubject.next(updated);
    await this.storageService.setItem(this.PARTS_KEY, updated);
    return created;
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const updated = await this.supabase.updatePart(id, updates);
    const current = this.partsSubject.getValue();
    const index = current.findIndex(p => p.id === id);
    if (index > -1) {
      current[index] = updated;
      this.partsSubject.next([...current]);
      await this.storageService.setItem(this.PARTS_KEY, current);
    }
    return updated;
  }

  async deletePart(id: string): Promise<void> {
    await this.supabase.deletePart(id);
    const current = this.partsSubject.getValue();
    const filtered = current.filter(p => p.id !== id);
    this.partsSubject.next(filtered);
    await this.storageService.setItem(this.PARTS_KEY, filtered);
  }

  // Stock level methods
  async updateStockLevel(partId: string, locationId: string, quantity: number): Promise<void> {
    await this.supabase.updateStockLevel(partId, locationId, quantity);
    await this.syncFromSupabase();
  }

  getStockByPart(partId: string): Observable<StockLevel[]> {
    return this.stockLevels$.pipe(
      map(levels => levels.filter(l => l.partId === partId))
    );
  }

  getStockByLocation(locationId: string): Observable<StockLevel[]> {
    return this.stockLevels$.pipe(
      map(levels => levels.filter(l => l.locationId === locationId))
    );
  }
}
