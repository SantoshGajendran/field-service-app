import { Injectable, NgZone } from '@angular/core';
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

  private syncDebounceTimer: any = null;
  private readonly SYNC_DEBOUNCE_MS = 3000;
  private scheduledRetryTimer: any = null;
  private lastSyncErrorTime = 0;
  private readonly MIN_ERROR_INTERVAL_MS = 15000;
  private currentSyncSessionId = 0;

  constructor(
    private networkService: NetworkService,
    private supabase: SupabaseService,
    private toastService: ToastService,
    private photoService: PhotoService,
    private syncQueueRepo: SyncQueueRepository,
    private ngZone: NgZone
  ) {
    this.initSyncListener();
    this.updatePendingCount();
  }

  private initSyncListener() {
    this.networkSub = this.networkService.isOnline$.subscribe(isOnline => {
      if (isOnline && !this.isSyncing) {
        this.scheduleSync();
      }
    });
  }

  private scheduleSync() {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
    }
    this.syncDebounceTimer = setTimeout(() => {
      this.ngZone.run(() => {
        this.drainSyncQueue();
      });
    }, this.SYNC_DEBOUNCE_MS);
  }

  private cancelScheduledSync() {
    if (this.syncDebounceTimer) {
      clearTimeout(this.syncDebounceTimer);
      this.syncDebounceTimer = null;
    }
    if (this.scheduledRetryTimer) {
      clearTimeout(this.scheduledRetryTimer);
      this.scheduledRetryTimer = null;
    }
  }

  private async updatePendingCount() {
    const queue = await this.syncQueueRepo.getAll();
    this.pendingCountSubject.next(queue.length);
  }

  private async drainSyncQueue() {
    if (this.isSyncing) return;

    this.isSyncing = true;
    this.syncingSubject.next(true);
    this.cancelScheduledSync();

    this.currentSyncSessionId = Date.now();
    const syncSessionId = this.currentSyncSessionId;

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
      let newPermanentFailures: SyncItem[] = [];
      let transientErrors: { itemId: string; error: string; entityType: string }[] = [];

      for (const item of queue) {
        if (item.status === 'FAILED') {
          continue;
        }

        if (item.retryCount > 0 && item.lastAttemptAt) {
          const backoffMs = Math.min(1000 * Math.pow(2, item.retryCount), 60000);
          const timeSinceLastAttempt = Date.now() - new Date(item.lastAttemptAt).getTime();
          if (timeSinceLastAttempt < backoffMs) {
            continue;
          }
        }

        try {
          item.lastAttemptAt = new Date().toISOString();
          await this.processSyncItem(item);
          await this.syncQueueRepo.remove(item.id);
          this.toastService.clearSyncFailureTracking(item.id);
          console.log(`Successfully synced item: ${item.id}`);
          successCount++;
          await this.updatePendingCount();
        } catch (error) {
          console.error(`Failed to sync item: ${item.id}`, error);
          failCount++;

          item.retryCount = (item.retryCount || 0) + 1;
          item.lastError = error instanceof Error ? error.message : String(error);

          if (item.retryCount >= 5) {
            item.status = 'FAILED';
            newPermanentFailures.push(item);
          } else {
            transientErrors.push({
              itemId: item.id,
              error: item.lastError,
              entityType: item.entityType
            });
          }

          await this.syncQueueRepo.update(item);

          if (!this.networkService.currentStatus) {
            break;
          }
        }

        if (this.currentSyncSessionId !== syncSessionId) {
          console.log('Sync cancelled - new sync session started');
          return;
        }
      }

      if (successCount > 0 && this.currentSyncSessionId === syncSessionId) {
        this.toastService.success(`Synced ${successCount} item(s) successfully`);
      }

      if (newPermanentFailures.length > 0 && this.currentSyncSessionId === syncSessionId) {
        const now = Date.now();
        if (now - this.lastSyncErrorTime > this.MIN_ERROR_INTERVAL_MS) {
          this.lastSyncErrorTime = now;
          if (newPermanentFailures.length === 1) {
            const failed = newPermanentFailures[0];
            this.toastService.error(`${failed.entityType} sync failed after 5 retries. Please try again later.`, 6000);
          } else {
            this.toastService.error(`${newPermanentFailures.length} item(s) failed to sync after multiple retries. Will retry later.`, 6000);
          }
        }
      }

      if (transientErrors.length > 0 && this.currentSyncSessionId === syncSessionId) {
        console.log(`Sync completed with ${transientErrors.length} transient failures - will retry automatically`);
      }

      const remaining = await this.syncQueueRepo.getAll();
      const pendingItems = remaining.filter(item => item.status === 'PENDING');
      if (pendingItems.length > 0 && this.networkService.currentStatus && this.currentSyncSessionId === syncSessionId) {
        this.scheduledRetryTimer = setTimeout(() => {
          this.ngZone.run(() => {
            if (this.currentSyncSessionId === syncSessionId) {
              this.drainSyncQueue();
            }
          });
        }, 10000);
      }
    } catch (err) {
      console.error('Error while draining sync queue', err);
      const now = Date.now();
      if (now - this.lastSyncErrorTime > this.MIN_ERROR_INTERVAL_MS) {
        this.lastSyncErrorTime = now;
        this.toastService.error('Sync failed. Will retry when online.');
      }
    } finally {
      if (this.currentSyncSessionId === syncSessionId) {
        this.isSyncing = false;
        this.syncingSubject.next(false);
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

    if (workOrder.photos && workOrder.photos.length > 0) {
      const uploadedPhotos = [];
      for (const photo of workOrder.photos) {
        if (photo.isLocal && photo.base64Data) {
          try {
            const uploadedPhoto = await this.photoService.uploadLocalPhoto(photo);
            uploadedPhotos.push(uploadedPhoto);
          } catch (error) {
            console.error('Failed to upload local photo:', error);
            throw new Error(`Photo upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        } else {
          uploadedPhotos.push(photo);
        }
      }
      workOrder.photos = uploadedPhotos;
    }

    if (workOrder.signature_url && workOrder.signature_url.startsWith('data:')) {
      try {
        const signatureData = await this.photoService.uploadSignature(
          workOrder.signature_url,
          workOrder.id
        );
        workOrder.signature_url = signatureData.url;
      } catch (error) {
        console.error('Failed to upload signature:', error);
        throw new Error(`Signature upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    switch (item.action) {
      case 'CREATE':
        try {
          await this.supabase.createWorkOrder(workOrder);
        } catch (error) {
          throw new Error(`Failed to create work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;
      case 'UPDATE':
        try {
          await this.supabase.updateWorkOrder(workOrder.id, workOrder);
        } catch (error) {
          throw new Error(`Failed to update work order: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;
      case 'DELETE':
        throw new Error('DELETE not implemented for work orders');
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  private async syncChecklist(item: SyncItem): Promise<void> {
    const checklist = item.payload;

    switch (item.action) {
      case 'UPDATE':
        try {
          await this.supabase.updateChecklist(checklist.id, checklist.items);
        } catch (error) {
          throw new Error(`Failed to update checklist: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
        break;
      default:
        throw new Error(`Unknown action: ${item.action}`);
    }
  }

  public async addToSyncQueue(item: SyncItem): Promise<void> {
    await this.syncQueueRepo.add(item);
    await this.updatePendingCount();

    if (this.networkService.currentStatus && !this.isSyncing) {
      this.scheduleSync();
    }
  }

  public async triggerSync(): Promise<void> {
    if (this.networkService.currentStatus) {
      this.cancelScheduledSync();
      this.scheduleSync();
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
