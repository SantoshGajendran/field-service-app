import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PushNotificationService, AppNotification } from '../../core/services/push-notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div class="header">
        <h2>Notifications</h2>
        <div class="header-actions">
          <button class="action-btn" (click)="markAllAsRead()" *ngIf="(notificationService.unreadCount$ | async) as count">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Mark all read
          </button>
          <button class="action-btn danger" (click)="clearAll()" *ngIf="(notificationService.notifications$ | async)?.length">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear all
          </button>
        </div>
      </div>

      <div class="notifications-list" *ngIf="(notificationService.notifications$ | async) as notifications">
        <div class="notification-item"
             *ngFor="let notification of notifications"
             [class.unread]="!notification.read"
             (click)="handleNotificationClick(notification)">

          <div class="notification-icon" [class]="getIconClass(notification.type)">
            <svg *ngIf="notification.type === 'work_order_assigned'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>

            <svg *ngIf="notification.type === 'status_changed'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>

            <svg *ngIf="notification.type === 'priority_update'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>

            <svg *ngIf="notification.type === 'admin_message'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h3>{{ notification.title }}</h3>
              <span class="notification-time">{{ getTimeAgo(notification.timestamp) }}</span>
            </div>
            <p class="notification-body">{{ notification.body }}</p>
            <span class="notification-type-badge">{{ getTypeBadge(notification.type) }}</span>
          </div>

          <button class="delete-btn" (click)="deleteNotification($event, notification.id)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div class="unread-indicator" *ngIf="!notification.read"></div>
        </div>

        <div class="empty-state" *ngIf="notifications.length === 0">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <h3>No notifications</h3>
          <p>You're all caught up!</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        color: var(--color-text-primary);
        font-weight: 700;
      }
    }

    .header-actions {
      display: flex;
      gap: 8px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        background: var(--glass-bg);
        border-color: var(--color-accent-primary);
      }

      &.danger {
        color: var(--color-status-error);
        border-color: var(--color-status-error);

        &:hover {
          background: rgba(239, 68, 68, 0.1);
        }
      }
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .notification-item {
      position: relative;
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-lg);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg);
        border-color: var(--color-accent-primary);
        transform: translateX(4px);
      }

      &.unread {
        background: rgba(14, 165, 233, 0.05);
        border-color: rgba(14, 165, 233, 0.3);
      }
    }

    .notification-icon {
      flex-shrink: 0;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 24px;
        height: 24px;
      }

      &.work_order_assigned {
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-accent-primary);
      }

      &.status_changed {
        background: rgba(34, 197, 94, 0.1);
        color: var(--color-status-success);
      }

      &.priority_update {
        background: rgba(245, 158, 11, 0.1);
        color: var(--color-status-warning);
      }

      &.admin_message {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
      }
    }

    .notification-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .notification-time {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      white-space: nowrap;
    }

    .notification-body {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    .notification-type-badge {
      display: inline-block;
      padding: 4px 10px;
      background: var(--glass-bg);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      align-self: flex-start;
    }

    .delete-btn {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      background: transparent;
      border: none;
      border-radius: 50%;
      color: var(--color-text-tertiary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-base);
      opacity: 0;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: rgba(239, 68, 68, 0.1);
        color: var(--color-status-error);
      }
    }

    .notification-item:hover .delete-btn {
      opacity: 1;
    }

    .unread-indicator {
      position: absolute;
      top: 16px;
      right: 16px;
      width: 10px;
      height: 10px;
      background: var(--color-accent-primary);
      border-radius: 50%;
      box-shadow: 0 0 10px var(--color-accent-primary);
      animation: pulse 2s ease-in-out infinite;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;

      svg {
        width: 64px;
        height: 64px;
        color: var(--color-text-tertiary);
        margin-bottom: 1rem;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
        color: var(--color-text-primary);
      }

      p {
        margin: 0;
        color: var(--color-text-secondary);
      }
    }

    @media (max-width: 640px) {
      .notifications-container {
        padding: 1rem;
      }

      .header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }

      .notification-item {
        gap: 12px;
        padding: 12px;
      }

      .notification-icon {
        width: 40px;
        height: 40px;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .action-btn {
        font-size: 0.8rem;
        padding: 6px 12px;
      }
    }
  `]
})
export class NotificationsComponent {
  notificationService = inject(PushNotificationService);

  handleNotificationClick(notification: AppNotification): void {
    this.notificationService.markAsRead(notification.id);
    // Navigation is handled by the service
  }

  deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead();
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notificationService.clearAll();
    }
  }

  getIconClass(type: string): string {
    return type;
  }

  getTypeBadge(type: string): string {
    const badges: Record<string, string> = {
      'work_order_assigned': 'New Assignment',
      'status_changed': 'Status Update',
      'priority_update': 'Priority Change',
      'admin_message': 'Admin Message'
    };
    return badges[type] || 'Notification';
  }

  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }
}
