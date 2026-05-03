import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { Checklist } from '../models/checklist.model';

const CHECKLIST_STORE_KEY = 'checklists';

@Injectable({
  providedIn: 'root'
})
export class ChecklistRepository {
  private storage = inject(StorageService);
  private supabase = inject(SupabaseService);

  // Single Source of Truth
  private checklistsSubject = new BehaviorSubject<Checklist[]>([]);
  public checklists$: Observable<Checklist[]> = this.checklistsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    // Try local storage first for immediate display
    const localData = await this.storage.get<Checklist[]>(CHECKLIST_STORE_KEY) || [];
    this.checklistsSubject.next(localData);
  }

  async getChecklistByWorkOrderId(workOrderId: string): Promise<Checklist | null> {
    try {
      const checklist = await this.supabase.getChecklistByWorkOrderId(workOrderId).toPromise();
      return checklist;
    } catch (error) {
      console.error('Error loading checklist from Supabase:', error);
      // Fallback to local storage
      const current = this.checklistsSubject.value;
      return current.find(c => c.workOrderId === workOrderId) || null;
    }
  }

  async updateChecklist(updatedChecklist: Checklist): Promise<void> {
    try {
      // Update in Supabase
      if (updatedChecklist.id) {
        await this.supabase.updateChecklist(updatedChecklist.id, updatedChecklist.items);
      }

      // Update local state
      const current = this.checklistsSubject.value;
      const exists = current.some(c => c.workOrderId === updatedChecklist.workOrderId);

      let updated: Checklist[];
      if (exists) {
        updated = current.map(c =>
          c.workOrderId === updatedChecklist.workOrderId ? updatedChecklist : c
        );
      } else {
        updated = [...current, updatedChecklist];
      }

      await this.storage.set(CHECKLIST_STORE_KEY, updated);
      this.checklistsSubject.next(updated);
    } catch (error) {
      console.error('Error updating checklist, saving locally:', error);
      // Queue for offline sync
      const current = this.checklistsSubject.value;
      const exists = current.some(c => c.workOrderId === updatedChecklist.workOrderId);

      let updated: Checklist[];
      if (exists) {
        updated = current.map(c =>
          c.workOrderId === updatedChecklist.workOrderId ? updatedChecklist : c
        );
      } else {
        updated = [...current, updatedChecklist];
      }

      await this.storage.set(CHECKLIST_STORE_KEY, updated);
      this.checklistsSubject.next(updated);
    }
  }
}
