import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncService } from '../../../core/services/sync.service';
import { NetworkService } from '../../../core/services/network.service';

@Component({
  selector: 'app-sync-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-status-fab"
         *ngIf="(syncService.pendingCount$ | async) as count"
         [class.syncing]="syncService.isSyncing$ | async"
         (click)="onSyncClick()">

      <div class="fab-content">
        <svg *ngIf="!(syncService.isSyncing$ | async)" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>

        <div *ngIf="syncService.isSyncing$ | async" class="spinner"></div>

        <span class="count-badge">{{ count }}</span>
      </div>

      <div class="fab-tooltip">
        {{ (syncService.isSyncing$ | async) ? 'Syncing...' : 'Tap to sync' }}
      </div>
    </div>
  `,
  styles: [`
    .sync-status-fab {
      position: fixed;
      bottom: 80px;
      right: 20px;
      width: 56px;
      height: 56px;
      background: var(--gradient-primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
      transition: all var(--transition-base);
      z-index: 1000;
      animation: pulse 2s ease-in-out infinite;

      &:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 24px rgba(14, 165, 233, 0.6);

        .fab-tooltip {
          opacity: 1;
          transform: translateX(-8px);
        }
      }

      &:active {
        transform: scale(0.95);
      }

      &.syncing {
        animation: none;
        background: linear-gradient(135deg, #10b981, #059669);
      }
    }

    .fab-content {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 28px;
        height: 28px;
        color: white;
      }
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .count-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      min-width: 24px;
      height: 24px;
      padding: 0 6px;
      background: var(--color-status-error);
      color: white;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
      border: 2px solid white;
    }

    .fab-tooltip {
      position: absolute;
      right: 68px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: all var(--transition-base);
      transform: translateX(0);
    }

    @keyframes pulse {
      0%, 100% {
        box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
      }
      50% {
        box-shadow: 0 4px 24px rgba(14, 165, 233, 0.6);
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .sync-status-fab {
        bottom: 70px;
        right: 16px;
        width: 48px;
        height: 48px;

        svg {
          width: 24px;
          height: 24px;
        }
      }

      .spinner {
        width: 24px;
        height: 24px;
      }

      .count-badge {
        min-width: 20px;
        height: 20px;
        font-size: 0.7rem;
      }
    }
  `]
})
export class SyncStatusComponent {
  syncService = inject(SyncService);
  networkService = inject(NetworkService);

  async onSyncClick() {
    if (this.networkService.currentStatus) {
      await this.syncService.triggerSync();
    }
  }
}
