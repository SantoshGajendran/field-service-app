import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();
  private recentMessages = new Map<string, number>(); // message -> timestamp

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    // Deduplicate: check if same message was shown recently (within 2 seconds)
    const messageKey = `${type}:${message}`;
    const now = Date.now();
    const lastShown = this.recentMessages.get(messageKey);

    if (lastShown && (now - lastShown) < 2000) {
      console.log('Skipping duplicate toast:', message);
      return;
    }

    this.recentMessages.set(messageKey, now);

    const id = crypto.randomUUID();
    const toast: Toast = { id, message, type, duration };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);

    setTimeout(() => {
      this.remove(id);
      // Clean up old entries from recentMessages map
      this.cleanupRecentMessages();
    }, duration);
  }

  private cleanupRecentMessages() {
    const now = Date.now();
    const threshold = 5000; // Keep entries for 5 seconds

    for (const [key, timestamp] of this.recentMessages.entries()) {
      if (now - timestamp > threshold) {
        this.recentMessages.delete(key);
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
