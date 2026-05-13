import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from './storage.service';
import { SupabaseService } from './supabase.service';
import { RmaRequest, RmaResolution } from '../models/rma.model';
import { ToastService } from './toast.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class RmaService {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  private readonly RMA_KEY = 'rma_requests';
  private rmaRequestsSubject = new BehaviorSubject<RmaRequest[]>([]);
  public rmaRequests$ = this.rmaRequestsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<RmaRequest[]>(this.RMA_KEY);
    if (cached) this.rmaRequestsSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getRmaRequests().subscribe({
        next: (requests) => {
          this.rmaRequestsSubject.next(requests);
          this.storageService.setItem(this.RMA_KEY, requests);
        },
        error: (error) => console.error('Error syncing RMA requests:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createRmaRequest(request: Omit<RmaRequest, 'id' | 'requestDate' | 'status'>): Promise<RmaRequest> {
    try {
      const rmaRequest: RmaRequest = {
        ...request,
        id: crypto.randomUUID(),
        requestDate: new Date().toISOString(),
        status: 'PENDING'
      };

      // Save locally first
      const current = this.rmaRequestsSubject.getValue();
      const updated = [...current, rmaRequest];
      this.rmaRequestsSubject.next(updated);
      await this.storageService.setItem(this.RMA_KEY, updated);

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'RMA',
        entityId: rmaRequest.id,
        action: 'CREATE',
        payload: rmaRequest,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('RMA request created successfully');
      return rmaRequest;
    } catch (error) {
      this.toastService.error('Failed to create RMA request');
      throw error;
    }
  }

  async updateRmaRequest(id: string, updates: Partial<RmaRequest>): Promise<RmaRequest> {
    try {
      const current = this.rmaRequestsSubject.getValue();
      const index = current.findIndex(r => r.id === id);

      if (index === -1) {
        throw new Error('RMA request not found');
      }

      const updated = { ...current[index], ...updates };
      current[index] = updated;

      this.rmaRequestsSubject.next([...current]);
      await this.storageService.setItem(this.RMA_KEY, current);

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'RMA',
        entityId: id,
        action: 'UPDATE',
        payload: updated,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('RMA request updated successfully');
      return updated;
    } catch (error) {
      this.toastService.error('Failed to update RMA request');
      throw error;
    }
  }

  async approveRmaRequest(id: string, rmaNumber: string): Promise<void> {
    try {
      await this.updateRmaRequest(id, {
        status: 'APPROVED',
        rmaNumber
      });
      this.toastService.success('RMA request approved');
    } catch (error) {
      this.toastService.error('Failed to approve RMA request');
      throw error;
    }
  }

  async rejectRmaRequest(id: string, reason: string): Promise<void> {
    try {
      await this.updateRmaRequest(id, {
        status: 'REJECTED',
        supplierResponse: reason
      });
      this.toastService.success('RMA request rejected');
    } catch (error) {
      this.toastService.error('Failed to reject RMA request');
      throw error;
    }
  }

  async resolveRmaRequest(id: string, resolution: RmaResolution): Promise<void> {
    try {
      await this.updateRmaRequest(id, {
        status: 'COMPLETED',
        resolutionType: resolution.resolutionType,
        rmaNumber: resolution.rmaNumber,
        supplierResponse: resolution.supplierResponse,
        trackingNumber: resolution.trackingNumber,
        resolutionDate: new Date().toISOString()
      });
      this.toastService.success('RMA request resolved');
    } catch (error) {
      this.toastService.error('Failed to resolve RMA request');
      throw error;
    }
  }

  async markAsShipped(id: string, trackingNumber: string): Promise<void> {
    try {
      await this.updateRmaRequest(id, {
        status: 'SHIPPED',
        trackingNumber
      });
      this.toastService.success('RMA marked as shipped');
    } catch (error) {
      this.toastService.error('Failed to update RMA status');
      throw error;
    }
  }

  getTechnicianRmas(techId: string): Observable<RmaRequest[]> {
    return this.rmaRequests$.pipe(map(requests => requests.filter(r => r.requestedBy === techId)));
  }

  getRmaRequestById(id: string): Observable<RmaRequest | undefined> {
    return this.rmaRequests$.pipe(
      map(requests => requests.find(r => r.id === id))
    );
  }

  getRmaRequestsByStatus(status: RmaRequest['status']): Observable<RmaRequest[]> {
    return this.rmaRequests$.pipe(
      map(requests => requests.filter(r => r.status === status))
    );
  }

  getRmaRequestsByPart(partId: string): Observable<RmaRequest[]> {
    return this.rmaRequests$.pipe(
      map(requests => requests.filter(r => r.partId === partId))
    );
  }

  getPendingRmaRequests(): Observable<RmaRequest[]> {
    return this.getRmaRequestsByStatus('PENDING');
  }

  getActiveRmaRequests(): Observable<RmaRequest[]> {
    return this.rmaRequests$.pipe(
      map(requests => requests.filter(r =>
        r.status === 'PENDING' || r.status === 'APPROVED' || r.status === 'SHIPPED'
      ))
    );
  }

  getCompletedRmaRequests(): Observable<RmaRequest[]> {
    return this.getRmaRequestsByStatus('COMPLETED');
  }

  getRmaStatistics(): Observable<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    shipped: number;
    completed: number;
    averageResolutionDays: number;
  }> {
    return this.rmaRequests$.pipe(
      map(requests => {
        const total = requests.length;
        const pending = requests.filter(r => r.status === 'PENDING').length;
        const approved = requests.filter(r => r.status === 'APPROVED').length;
        const rejected = requests.filter(r => r.status === 'REJECTED').length;
        const shipped = requests.filter(r => r.status === 'SHIPPED').length;
        const completed = requests.filter(r => r.status === 'COMPLETED').length;

        // Calculate average resolution time for completed requests
        const completedRequests = requests.filter(r => r.status === 'COMPLETED' && r.resolutionDate);
        const totalDays = completedRequests.reduce((sum, r) => {
          const requestDate = new Date(r.requestDate);
          const resolutionDate = new Date(r.resolutionDate!);
          const days = Math.floor((resolutionDate.getTime() - requestDate.getTime()) / (1000 * 60 * 60 * 24));
          return sum + days;
        }, 0);

        const averageResolutionDays = completedRequests.length > 0
          ? Math.round(totalDays / completedRequests.length)
          : 0;

        return {
          total,
          pending,
          approved,
          rejected,
          shipped,
          completed,
          averageResolutionDays
        };
      })
    );
  }

  async deleteRmaRequest(id: string): Promise<void> {
    try {
      const current = this.rmaRequestsSubject.getValue();
      const filtered = current.filter(r => r.id !== id);

      this.rmaRequestsSubject.next(filtered);
      await this.storageService.setItem(this.RMA_KEY, filtered);

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'RMA',
        entityId: id,
        action: 'DELETE',
        payload: { id },
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('RMA request deleted');
    } catch (error) {
      this.toastService.error('Failed to delete RMA request');
      throw error;
    }
  }
}
