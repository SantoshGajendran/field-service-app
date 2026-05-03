import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NetworkService } from '../../../core/services/network.service';
import { SyncService } from '../../../core/services/sync.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="offline-banner" *ngIf="!(networkService.isOnline$ | async)">
      <div class="banner-content">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="1" y1="1" x2="23" y2="23"></line>
          <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
          <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
          <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
          <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
          <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
          <line x1="12" y1="20" x2="12.01" y2="20"></line>
        </svg>
        <div class="banner-text">
          <span class="title">You're offline</span>
          <span class="subtitle">Changes will sync when connection is restored</span>
        </div>
        <div class="pending-badge" *ngIf="(syncService.pendingCount$ | async) as count">
          <span>{{ count }} pending</span>
        </div>
      </div>
    </div>

    <div class="sync-banner" *ngIf="(networkService.isOnline$ | async) && (syncService.isSyncing$ | async)">
      <div class="banner-content">
        <div class="spinner"></div>
        <div class="banner-text">
          <span class="title">Syncing...</span>
          <span class="subtitle" *ngIf="(syncService.pendingCount$ | async) as count">
            {{ count }} item(s) remaining
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .offline-banner,
    .sync-banner {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9998;
      padding: 12px 16px;
      animation: slideDown 0.3s ease-out;
    }

    .offline-banner {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95));
      backdrop-filter: blur(10px);
      border-bottom: 2px solid rgba(239, 68, 68, 0.5);
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    }

    .sync-banner {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.95), rgba(2, 132, 199, 0.95));
      backdrop-filter: blur(10px);
      border-bottom: 2px solid rgba(14, 165, 233, 0.5);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
    }

    .banner-content {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }

    .icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      flex-shrink: 0;
    }

    .banner-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .title {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.3px;
    }

    .subtitle {
      font-size: 0.8rem;
      opacity: 0.9;
      font-weight: 500;
    }

    .pending-badge {
      padding: 6px 12px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 700;
      white-space: nowrap;
      backdrop-filter: blur(10px);
    }

    @keyframes slideDown {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 640px) {
      .offline-banner,
      .sync-banner {
        padding: 10px 12px;
      }

      .title {
        font-size: 0.85rem;
      }

      .subtitle {
        font-size: 0.75rem;
      }

      .pending-badge {
        font-size: 0.75rem;
        padding: 4px 10px;
      }
    }
  `]
})
export class OfflineIndicatorComponent {
  networkService = inject(NetworkService);
  syncService = inject(SyncService);
}
