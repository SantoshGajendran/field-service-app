import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

interface SyncFailureKey {
  itemId: string;
  entityType: string;
  action: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private maxToasts = 3;
  private globalDebounceMs = 1000;
  private lastToastTime = new Map<string, number>();
  private toastCooldownMs = 2000;

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    const currentToasts = this.toastsSubject.value;
    const messageKey = `${type}:${message}`;
    const now = Date.now();

    if (currentToasts.length >= this.maxToasts) {
      const oldestToast = currentToasts[0];
      this.remove(oldestToast.id);
    }

    const lastShown = this.lastToastTime.get(messageKey);
    if (lastShown && (now - lastShown) < this.toastCooldownMs) {
      return;
    }

    this.lastToastTime.set(messageKey, now);

    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };

    this.toastsSubject.next([...this.toastsSubject.value, toast]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  shouldShowSyncFailure(item: SyncFailureKey): boolean {
    const key = `${item.itemId}:${item.entityType}:${item.action}`;
    const now = Date.now();
    const lastShown = this.lastToastTime.get(key);

    if (lastShown && (now - lastShown) < this.toastCooldownMs) {
      return false;
    }

    this.lastToastTime.set(key, now);
    return true;
  }

  clearSyncFailureTracking(itemId: string) {
    for (const key of this.lastToastTime.keys()) {
      if (key.startsWith(`${itemId}:`)) {
        this.lastToastTime.delete(key);
      }
    }
  }

  success(message: string, duration: number = 3000) {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 4000) {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 3000) {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 3000) {
    this.show(message, 'warning', duration);
  }

  remove(id: string) {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(t => t.id !== id));
  }
}
