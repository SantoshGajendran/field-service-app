import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { WorkOrder } from '../models/work-order.model';

@Injectable({
  providedIn: 'root'
})
export class WorkOrderRepository {
  private readonly STORAGE_KEY = 'work_orders';
  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>([]);

  public workOrders$: Observable<WorkOrder[]> = this.workOrdersSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private supabase: SupabaseService
  ) {
    this.loadInitialData();
    this.setupRealtimeSubscription();
  }

  private async loadInitialData() {
    // Try to load from Supabase first
    this.supabase.getWorkOrders().subscribe({
      next: (workOrders) => {
        this.workOrdersSubject.next(workOrders);
        // Cache locally for offline access
        this.storageService.setItem(this.STORAGE_KEY, workOrders);
      },
      error: async (error) => {
        console.error('Error loading from Supabase, using local cache:', error);
        // Fallback to local storage if Supabase fails
        const data = await this.storageService.getItem<WorkOrder[]>(this.STORAGE_KEY);
        if (data) {
          this.workOrdersSubject.next(data);
        }
      }
    });
  }

  private setupRealtimeSubscription() {
    this.supabase.subscribeToWorkOrders((payload) => {
      console.log('Real-time update:', payload);
      this.loadInitialData(); // Reload data on changes
    });
  }

  public async getAll(): Promise<WorkOrder[]> {
    return this.workOrdersSubject.getValue();
  }

  public async saveAll(workOrders: WorkOrder[]): Promise<void> {
    await this.storageService.setItem(this.STORAGE_KEY, workOrders);
    this.workOrdersSubject.next(workOrders);
  }

  public async addOrUpdate(workOrder: WorkOrder): Promise<void> {
    try {
      // Update in Supabase
      if (workOrder.id && workOrder.id.startsWith('WO-')) {
        // Existing work order - update
        await this.supabase.updateWorkOrder(workOrder.id, workOrder);
      } else {
        // New work order - create
        await this.supabase.createWorkOrder(workOrder);
      }

      // Update local state
      const current = this.workOrdersSubject.getValue();
      const index = current.findIndex(w => w.id === workOrder.id);
      let updated = [...current];

      if (index > -1) {
        updated[index] = workOrder;
      } else {
        updated.push(workOrder);
      }

      this.workOrdersSubject.next(updated);
      await this.storageService.setItem(this.STORAGE_KEY, updated);
    } catch (error) {
      console.error('Error saving work order, queuing for sync:', error);
      // Queue for offline sync
      const current = this.workOrdersSubject.getValue();
      const index = current.findIndex(w => w.id === workOrder.id);
      let updated = [...current];

      if (index > -1) {
        updated[index] = workOrder;
      } else {
        updated.push(workOrder);
      }

      await this.saveAll(updated);
    }
  }

  // Alias for compatibility
  public async update(workOrder: WorkOrder): Promise<void> {
    return this.addOrUpdate(workOrder);
  }

  public async remove(id: string): Promise<void> {
    const current = this.workOrdersSubject.getValue();
    const updated = current.filter(w => w.id !== id);
    await this.saveAll(updated);
  }

  public async syncWorkOrders(): Promise<void> {
    try {
      const workOrders = await new Promise<WorkOrder[]>((resolve, reject) => {
        this.supabase.getWorkOrders().subscribe({
          next: (data) => resolve(data),
          error: (err) => reject(err)
        });
      });

      this.workOrdersSubject.next(workOrders);
      await this.storageService.setItem(this.STORAGE_KEY, workOrders);
    } catch (error) {
      console.error('Error syncing work orders:', error);
      throw error;
    }
  }
}
