import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, from, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.anonKey
    );

    // Check for existing session on initialization
    this.supabase.auth.getSession().then(({ data }) => {
      this.currentUserSubject.next(data.session?.user ?? null);
    }).catch(error => {
      console.error('Error getting session:', error);
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUserSubject.next(session?.user ?? null);
    });
  }

  // Authentication
  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    return user;
  }

  // Work Orders
  getWorkOrders(): Observable<any[]> {
    return from(
      this.supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data || [];
      })
    );
  }

  getWorkOrderById(id: string): Observable<any> {
    return from(
      this.supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data;
      })
    );
  }

  async updateWorkOrder(id: string, updates: any) {
    const { data, error } = await this.supabase
      .from('work_orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async createWorkOrder(workOrder: any) {
    const { data, error } = await this.supabase
      .from('work_orders')
      .insert(workOrder)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Checklists
  getChecklistByWorkOrderId(workOrderId: string): Observable<any> {
    return from(
      this.supabase
        .from('checklists')
        .select('*')
        .eq('work_order_id', workOrderId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          // If no checklist exists, return null
          if (error.code === 'PGRST116') return null;
          throw error;
        }
        return data;
      })
    );
  }

  async updateChecklist(id: string, items: any[]) {
    const { data, error } = await this.supabase
      .from('checklists')
      .update({ items })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Profiles
  async getProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToWorkOrders(callback: (payload: any) => void) {
    return this.supabase
      .channel('work_orders_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'work_orders' },
        callback
      )
      .subscribe();
  }

  // Statistics
  async getStatistics() {
    const { data: workOrders, error } = await this.supabase
      .from('work_orders')
      .select('status');

    if (error) throw error;

    const total = workOrders?.length || 0;
    const open = workOrders?.filter(wo => wo.status === 'OPEN').length || 0;
    const inProgress = workOrders?.filter(wo => wo.status === 'IN_PROGRESS').length || 0;
    const completed = workOrders?.filter(wo => wo.status === 'COMPLETED').length || 0;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      open,
      inProgress,
      completed,
      completionRate
    };
  }

  // Storage operations
  async uploadFile(bucket: string, path: string, file: Blob) {
    return await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
  }

  getPublicUrl(bucket: string, path: string) {
    return this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
  }

  async deleteFile(bucket: string, path: string) {
    return await this.supabase.storage
      .from(bucket)
      .remove([path]);
  }
}
