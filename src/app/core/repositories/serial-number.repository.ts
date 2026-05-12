import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { SerializedPart } from '../models/usage.model';

@Injectable({
  providedIn: 'root'
})
export class SerialNumberRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly SERIALIZED_PARTS_KEY = 'serialized_parts';
  private serializedPartsSubject = new BehaviorSubject<SerializedPart[]>([]);
  public serializedParts$ = this.serializedPartsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<SerializedPart[]>(this.SERIALIZED_PARTS_KEY);
    if (cached) this.serializedPartsSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getSerializedParts().subscribe({
        next: (parts) => {
          this.serializedPartsSubject.next(parts);
          this.storageService.setItem(this.SERIALIZED_PARTS_KEY, parts);
        },
        error: (error) => console.error('Error syncing serialized parts:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createSerializedPart(part: SerializedPart): Promise<SerializedPart> {
    const created = await this.supabase.createSerializedPart(part);
    const current = this.serializedPartsSubject.getValue();
    const updated = [...current, created];
    this.serializedPartsSubject.next(updated);
    await this.storageService.setItem(this.SERIALIZED_PARTS_KEY, updated);
    return created;
  }

  async updateSerializedPart(id: string, updates: Partial<SerializedPart>): Promise<SerializedPart> {
    const updated = await this.supabase.updateSerializedPart(id, updates);
    const current = this.serializedPartsSubject.getValue();
    const index = current.findIndex(p => p.id === id);
    if (index > -1) {
      current[index] = updated;
      this.serializedPartsSubject.next([...current]);
      await this.storageService.setItem(this.SERIALIZED_PARTS_KEY, current);
    }
    return updated;
  }

  getBySerialNumber(serialNumber: string): Observable<SerializedPart | undefined> {
    return this.serializedParts$.pipe(
      map(parts => parts.find(p => p.serialNumber === serialNumber))
    );
  }

  getByPartId(partId: string): Observable<SerializedPart[]> {
    return this.serializedParts$.pipe(
      map(parts => parts.filter(p => p.partId === partId))
    );
  }

  getByStatus(status: SerializedPart['status']): Observable<SerializedPart[]> {
    return this.serializedParts$.pipe(
      map(parts => parts.filter(p => p.status === status))
    );
  }

  getByLocation(locationId: string): Observable<SerializedPart[]> {
    return this.serializedParts$.pipe(
      map(parts => parts.filter(p => p.currentLocationId === locationId))
    );
  }

  getInstalledParts(equipmentId?: string): Observable<SerializedPart[]> {
    return this.serializedParts$.pipe(
      map(parts => parts.filter(p =>
        p.status === 'INSTALLED' &&
        (!equipmentId || p.installedOnEquipmentId === equipmentId)
      ))
    );
  }

  getPartsUnderWarranty(): Observable<SerializedPart[]> {
    return this.serializedParts$.pipe(
      map(parts => {
        const now = new Date();
        return parts.filter(p => {
          if (!p.warrantyExpirationDate) return false;
          const expirationDate = new Date(p.warrantyExpirationDate);
          return expirationDate > now;
        });
      })
    );
  }
}
