import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { CheckoutSession } from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly CHECKOUT_KEY = 'checkout_sessions';
  private checkoutSessionsSubject = new BehaviorSubject<CheckoutSession[]>([]);
  public checkoutSessions$ = this.checkoutSessionsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<CheckoutSession[]>(this.CHECKOUT_KEY);
    if (cached) this.checkoutSessionsSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getCheckoutSessions().subscribe({
        next: (sessions: CheckoutSession[]) => {
          this.checkoutSessionsSubject.next(sessions);
          this.storageService.setItem(this.CHECKOUT_KEY, sessions);
        },
        error: (error: any) => console.error('Error syncing checkout sessions:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createCheckoutSession(session: CheckoutSession): Promise<CheckoutSession> {
    const created = await this.supabase.createCheckoutSession(session);
    const current = this.checkoutSessionsSubject.getValue();
    const updated = [...current, created];
    this.checkoutSessionsSubject.next(updated);
    await this.storageService.setItem(this.CHECKOUT_KEY, updated);
    return created;
  }

  async updateCheckoutSession(id: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const updated = await this.supabase.updateCheckoutSession(id, updates);
    const current = this.checkoutSessionsSubject.getValue();
    const index = current.findIndex(s => s.id === id);
    if (index > -1) {
      current[index] = updated;
      this.checkoutSessionsSubject.next([...current]);
      await this.storageService.setItem(this.CHECKOUT_KEY, current);
    }
    return updated;
  }

  getActiveCheckouts(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutSessions$.pipe(
      map(sessions => sessions.filter(s =>
        s.status === 'ACTIVE' && (!technicianId || s.technicianId === technicianId)
      ))
    );
  }

  getCheckoutHistory(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutSessions$.pipe(
      map(sessions => sessions.filter(s =>
        s.status === 'COMPLETED' && (!technicianId || s.technicianId === technicianId)
      ))
    );
  }
}
