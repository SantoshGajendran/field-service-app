import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toastService.toasts$ | async"
        class="toast"
        [class.success]="toast.type === 'success'"
        [class.error]="toast.type === 'error'"
        [class.info]="toast.type === 'info'"
        [class.warning]="toast.type === 'warning'">

        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>

          <svg *ngIf="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>

          <svg *ngIf="toast.type === 'info'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>

          <svg *ngIf="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <span class="toast-message">{{ toast.message }}</span>

        <button class="toast-close" (click)="toastService.remove(toast.id)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border-radius: var(--radius-lg);
      border: 1px solid var(--glass-border);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      animation: slideIn 0.3s ease-out;
      pointer-events: auto;
      min-width: 300px;
    }

    .toast.success {
      border-color: var(--color-status-success);
      background: rgba(34, 197, 94, 0.1);

      .toast-icon {
        color: var(--color-status-success);
      }
    }

    .toast.error {
      border-color: var(--color-status-error);
      background: rgba(239, 68, 68, 0.1);

      .toast-icon {
        color: var(--color-status-error);
      }
    }

    .toast.info {
      border-color: var(--color-accent-primary);
      background: rgba(14, 165, 233, 0.1);

      .toast-icon {
        color: var(--color-accent-primary);
      }
    }

    .toast.warning {
      border-color: var(--color-status-warning);
      background: rgba(245, 158, 11, 0.1);

      .toast-icon {
        color: var(--color-status-warning);
      }
    }

    .toast-icon {
      flex-shrink: 0;
      width: 24px;
      height: 24px;

      svg {
        width: 100%;
        height: 100%;
      }
    }

    .toast-message {
      flex: 1;
      color: var(--color-text-primary);
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.4;
    }

    .toast-close {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      background: transparent;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      transition: all var(--transition-base);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-text-primary);
      }
    }

    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 640px) {
      .toast-container {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
      }

      .toast {
        min-width: auto;
      }
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
}
