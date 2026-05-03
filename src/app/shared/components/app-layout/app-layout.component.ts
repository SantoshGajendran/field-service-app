import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NetworkService } from '../../../core/services/network.service';
import { PushNotificationService } from '../../../core/services/push-notification.service';
import { SyncQueueViewerComponent } from '../sync-queue-viewer/sync-queue-viewer.component';
import { OfflineIndicatorComponent } from '../offline-indicator/offline-indicator.component';
import { SyncStatusComponent } from '../sync-status/sync-status.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SyncQueueViewerComponent, OfflineIndicatorComponent, SyncStatusComponent],
  template: `
    <div class="layout-container">
      <!-- Offline/Sync Indicator -->
      <app-offline-indicator></app-offline-indicator>

      <!-- Top Sticky Header -->
      <header class="glass-panel app-header">
        <div class="brand">
          <span class="neon-text-primary">FIELD</span>SERVICE
        </div>

        <div class="network-status" [ngClass]="(isOnline$ | async) ? 'online' : 'offline'">
          <span class="status-indicator"></span>
          <span class="status-text">{{ (isOnline$ | async) ? 'ONLINE' : 'OFFLINE' }}</span>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="content-area">
        <ng-content></ng-content>
      </main>

      <!-- Sync Status FAB -->
      <app-sync-status></app-sync-status>

      <!-- Sync Queue Viewer (Floating dev tool) -->
      <app-sync-queue-viewer></app-sync-queue-viewer>

      <!-- Bottom Tab Navigation -->
      <nav class="glass-panel app-nav">
        <a routerLink="/admin" routerLinkActive="active" class="nav-item">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <span>Admin</span>
        </a>

        <a routerLink="/work-orders" routerLinkActive="active" class="nav-item">
          <div class="icon">
            <!-- Icon SVG (placeholder for real icons) -->
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <span>Tasks</span>
        </a>

        <a routerLink="/inventory" routerLinkActive="active" class="nav-item">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          <span>Inventory</span>
        </a>

        <a routerLink="/notifications" routerLinkActive="active" class="nav-item">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            <span class="notification-badge" *ngIf="(notificationService.unreadCount$ | async) as count">
              {{ count > 99 ? '99+' : count }}
            </span>
          </div>
          <span>Alerts</span>
        </a>

        <a routerLink="/profile" routerLinkActive="active" class="nav-item">
          <div class="icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  `,
  styles: [`
    .layout-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      position: relative;
      z-index: 1;
    }

    .app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      position: sticky;
      top: 0;
      z-index: 100;
      border-radius: 0 0 var(--radius-lg) var(--radius-lg);
      border-top: none;
      border-left: none;
      border-right: none;
      animation: slideDown 0.5s ease-out;

      .brand {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: 2px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .network-status {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 1px;
        padding: 8px 14px;
        border-radius: var(--radius-full);
        background: var(--glass-bg-light);
        border: 1px solid var(--glass-border);
        transition: all var(--transition-base);

        .status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          transition: all var(--transition-base);
        }

        &.online {
          color: var(--color-status-success);
          background: rgba(16, 185, 129, 0.1);
          border-color: rgba(16, 185, 129, 0.3);

          .status-indicator {
            background-color: var(--color-status-success);
            box-shadow: 0 0 12px var(--color-status-success), 0 0 24px var(--color-status-success);
            animation: pulse 2s ease-in-out infinite;
          }
        }

        &.offline {
          color: var(--color-status-offline);
          background: rgba(100, 116, 139, 0.1);
          border-color: rgba(100, 116, 139, 0.3);

          .status-indicator {
            background-color: var(--color-status-offline);
          }
        }
      }
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .content-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      padding-bottom: calc(100px + env(safe-area-inset-bottom));
      -webkit-overflow-scrolling: touch;
      animation: fadeIn 0.6s ease-out;
    }

    .app-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 12px 8px;
      padding-bottom: max(12px, env(safe-area-inset-bottom));
      position: sticky;
      bottom: 0;
      z-index: 100;
      border-radius: var(--radius-xl) var(--radius-xl) 0 0;
      border-bottom: none;
      border-left: none;
      border-right: none;
      animation: slideUp 0.5s ease-out;

      .nav-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: var(--color-text-secondary);
        text-decoration: none;
        font-size: 0.7rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        transition: all var(--transition-base);
        padding: 12px 18px;
        min-height: 48px;
        min-width: 48px;
        border-radius: var(--radius-md);
        position: relative;

        .icon {
          width: 24px;
          height: 24px;
          transition: all var(--transition-base);
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: -6px;
          right: -8px;
          min-width: 18px;
          height: 18px;
          padding: 0 5px;
          background: var(--color-status-error);
          color: white;
          border-radius: 9px;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(239, 68, 68, 0.4);
          border: 2px solid var(--color-bg-primary);
          animation: pulse 2s ease-in-out infinite;
        }

        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 3px;
          background: var(--gradient-primary);
          border-radius: 0 0 var(--radius-sm) var(--radius-sm);
          transition: width var(--transition-base);
        }

        &:hover {
          color: var(--color-accent-primary);
          transform: translateY(-2px);
        }

        &.active {
          color: var(--color-accent-primary);
          background: rgba(14, 165, 233, 0.15);
          border: 1px solid rgba(14, 165, 233, 0.3);

          &::before {
            width: 60%;
          }

          .icon {
            filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.6));
            transform: scale(1.1);
          }
        }
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Landscape Mode Optimization */
    @media (orientation: landscape) and (max-height: 600px) {
      .app-header {
        padding: 12px 16px;
        font-size: 0.9rem;
      }

      .app-nav {
        flex-direction: column;
        width: 80px;
        height: 100vh;
        left: 0;
        right: auto;
        bottom: 0;
        top: 0;
        border-radius: 0 var(--radius-xl) var(--radius-xl) 0;
        padding: 12px 8px;
        padding-left: max(8px, env(safe-area-inset-left));
        justify-content: center;
        gap: 8px;

        .nav-item {
          width: 100%;
          padding: 12px 8px;

          span {
            font-size: 0.65rem;
          }
        }
      }

      .content-area {
        margin-left: 80px;
        padding: 16px;
        padding-bottom: 16px;
      }
    }

    /* Tablet Landscape */
    @media (orientation: landscape) and (min-width: 768px) {
      .app-nav {
        width: 100px;

        .nav-item {
          .icon {
            width: 28px;
            height: 28px;
          }

          span {
            font-size: 0.75rem;
          }
        }
      }

      .content-area {
        margin-left: 100px;
        padding: 24px;
      }
    }
  `]
})
export class AppLayoutComponent {
  private networkService = inject(NetworkService);
  notificationService = inject(PushNotificationService);
  isOnline$ = this.networkService.isOnline$;
}
