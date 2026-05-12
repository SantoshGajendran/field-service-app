import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { PartUsage } from '../models/usage.model';

@Injectable({
  providedIn: 'root'
})
export class UsageRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly USAGE_KEY = 'part_usage';
  private partUsageSubject = new BehaviorSubject<PartUsage[]>([]);
  public partUsage$ = this.partUsageSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<PartUsage[]>(this.USAGE_KEY);
    if (cached) this.partUsageSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getPartUsage().subscribe({
        next: (usage: PartUsage[]) => {
          this.partUsageSubject.next(usage);
          this.storageService.setItem(this.USAGE_KEY, usage);
        },
        error: (error: any) => console.error('Error syncing part usage:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createPartUsage(usage: PartUsage): Promise<PartUsage> {
    const created = await this.supabase.createPartUsage(usage);
    const current = this.partUsageSubject.getValue();
    const updated = [...current, created];
    this.partUsageSubject.next(updated);
    await this.storageService.setItem(this.USAGE_KEY, updated);
    return created;
  }

  getWorkOrderUsage(workOrderId: string): Observable<PartUsage[]> {
    return this.partUsage$.pipe(
      map(usage => usage.filter(u => u.workOrderId === workOrderId))
    );
  }

  getTechnicianUsage(technicianId: string): Observable<PartUsage[]> {
    return this.partUsage$.pipe(
      map(usage => usage.filter(u => u.technicianId === technicianId))
    );
  }
}
