import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { SupabaseService } from './supabase.service';
import { ToastService } from './toast.service';
import { PhotoService } from './photo.service';
import { SyncQueueRepository } from '../repositories/sync-queue.repository';
import { SyncItem } from '../models/sync-item.model';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private networkSub!: Subscription;
  private isSyncing = false;
  private syncingSubject = new BehaviorSubject<boolean>(false);
  public isSyncing$ = this.syncingSubject.asObservable();

  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(
    private networkService: NetworkService,
    private supabase: SupabaseService,
    private toastService: ToastService,
    private photoService: PhotoService,
    private syncQueueRepo: SyncQueueRepository
  ) {
    this.initSyncListener();
    this.updatePendingCount();
  }

  private initSyncListener() {
    this.networkSub = this.networkService.isOnline$.subscribe(isOnline => {
      if (isOnline && !this.isSyncing) {
        this.drainSyncQueue();
      }
    });
  }

  private async updatePendingCount() {
    const queue = await this.syncQueueRepo.getAll();
    this.pendingCountSubject.next(queue.length);
  }

  private async drainSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.syncingSubject.next(true);

    try {
      const queue = await this.syncQueueRepo.getAll();
      if (queue.length === 0) {
        this.isSyncing = false;
        this.syncingSubject.next(false);
        return;
      }

      console.log(`Starting sync process for ${queue.length} items...`);
      let successCount = 0;
      let failCount = 0;

      // FIFO order: Process items one by one
      for (const item of queue) {
        try {
          await this.processSyncItem(item);
          // If successful, remove from queue
          await this.syncQueueRepo.remove(item.id);
          console.log(`Successfully synced item: ${item.id}`);
          successCount++;
          await this.updatePendingCount();
        } catch (error) {
          console.error(`Failed to sync item: ${item.id}`, error);
          failCount++;

          // Implement retry logic
          item.retryCount = (item.retryCount || 0) + 1;
          item.status = item.retryCount >= 3 ? 'FAILED' : 'PENDING';
          await this.syncQueueRepo.update(item);

          // Stop draining if we hit network errors during sync
          if (!this.networkService.currentStatus) {
            break;
          }
        }
      }

      // Show summary toast
      if (successCount > 0) {
        this.toastService.success(`Synced ${successCount} item(s) successfully`);
      }
      if (failCount > 0) {
        this.toastService.warning(`${failCount} item(s) failed to sync`);
      }
    } catch (err) {
      console.error('Error while draining sync queue', err);
      this.toastService.error('Sync failed. Will retry when online.');
    } finally {
      this.isSyncing = false;
      this.syncingSubject.next(false);

      // If queue still has items and we are online, trigger another drain
      const remaining = await this.syncQueueRepo.getAll();
      if (remaining.length > 0 && this.networkService.currentStatus) {
        setTimeout(() => this.drainSyncQueue(), 1000);
      }
    }
  }

  private async processSyncItem(item: SyncItem): Promise<void> {
    console.log(`Syncing ${item.entityType} (${item.action}) - ID: ${item.entityId}`);

    switch (item.entityType) {
      case 'WORK_ORDER':
        return this.syncWorkOrder(item);
      case 'CHECKLIST':
        return this.syncChecklist(item);
      default:
        throw new Error(`Unknown entity type: ${item.entityType}`);
    }
  }

  private async syncWorkOrder(item: SyncItem): Promise<void> {
    const workOrder = item.payload;

    // Upload any local photos first
    if (workOrder.photos && workOrder.photos.length > 0) {
      const uploadedPhotos = [];
      for (const photo of workOrder.photos) {
        if (photo.isLocal && photo.base64Data) {
          try {
            const uploadedPhoto = await this.photoService.uploadLocalPhoto(photo);
            uploadedPhotos.push(uploadedPhoto);
          } catch (error) {
            console.error('Failed to upload local photo:', error);
            // Keep the local photo if upload fails
            uploadedPhotos.push(photo);
          }
        } else {
          uploadedPhotos.push(photo);
        }
      }
      workOrder.photos = uploadedPhotos;
    }

    // Upload local signature if exists
    if (workOrder.signature_url && workOrder.signature_url.startsWith('data:')) {
      try {
        const signatureData = await this.photoService.uploadSignature(
          workOrder.signature_url,
          workOrder.id
        );
        workOrder.signature_url = signatureData.url;
      } catch (error) {
        console.error('Failed to upload signature:', error);
        // Keep local signature if upload fails
      }
    }

    switch (item.action) {
      case 'CREATE':
        await this.supabase.createWorkOrder(workOrder);
        break;
      case 'UPDATE':
        await this.supabase.updateWorkOrder(workOrder.id, workOrder);
        break;
      case 'DELETE':
        // Implement delete if needed
        throw new Error('DELETE not implemented for work orders');
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  private async syncChecklist(item: SyncItem): Promise<void> {
    const checklist = item.payload;

    switch (item.action) {
      case 'UPDATE':
        await this.supabase.updateChecklist(checklist.id, checklist.items);
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  // Called by other services (Outbox Pattern)
  public async addToSyncQueue(item: SyncItem): Promise<void> {
    await this.syncQueueRepo.add(item);
    await this.updatePendingCount();

    // If online, try to sync immediately
    if (this.networkService.currentStatus && !this.isSyncing) {
      this.drainSyncQueue();
    }
  }

  // Manual sync trigger
  public async triggerSync(): Promise<void> {
    if (this.networkService.currentStatus) {
      await this.drainSyncQueue();
    } else {
      this.toastService.warning('Cannot sync while offline');
    }
  }

  // Get pending sync count
  public async getPendingCount(): Promise<number> {
    const queue = await this.syncQueueRepo.getAll();
    return queue.length;
  }

  ngOnDestroy() {
    if (this.networkSub) {
      this.networkSub.unsubscribe();
    }
  }
}
