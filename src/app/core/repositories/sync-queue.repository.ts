import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SyncItem } from '../models/sync-item.model';

@Injectable({
  providedIn: 'root'
})
export class SyncQueueRepository {
  private readonly STORAGE_KEY = 'sync_queue';
  private syncQueueSubject = new BehaviorSubject<SyncItem[]>([]);

  public syncQueue$: Observable<SyncItem[]> = this.syncQueueSubject.asObservable();

  constructor(private storageService: StorageService) {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const data = await this.storageService.getItem<SyncItem[]>(this.STORAGE_KEY);
    if (data) {
      this.syncQueueSubject.next(data);
    }
  }

  public async getAll(): Promise<SyncItem[]> {
    return this.syncQueueSubject.getValue();
  }

  public async saveAll(syncItems: SyncItem[]): Promise<void> {
    await this.storageService.setItem(this.STORAGE_KEY, syncItems);
    this.syncQueueSubject.next(syncItems);
  }

  public async add(syncItem: SyncItem): Promise<void> {
    const current = this.syncQueueSubject.getValue();
    const updated = [...current, syncItem];
    await this.saveAll(updated);
  }

  public async remove(id: string): Promise<void> {
    const current = this.syncQueueSubject.getValue();
    const updated = current.filter(item => item.id !== id);
    await this.saveAll(updated);
  }

  public async update(syncItem: SyncItem): Promise<void> {
    const current = this.syncQueueSubject.getValue();
    const index = current.findIndex(item => item.id === syncItem.id);
    if (index > -1) {
      const updated = [...current];
      updated[index] = syncItem;
      await this.saveAll(updated);
    }
  }
}
