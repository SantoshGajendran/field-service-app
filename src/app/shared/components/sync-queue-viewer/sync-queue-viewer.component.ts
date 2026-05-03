import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SyncQueueRepository } from '../../../core/repositories/sync-queue.repository';
import { SyncService } from '../../../core/services/sync.service';
import { SyncItem } from '../../../core/models/sync-item.model';

@Component({
  selector: 'app-sync-queue-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-queue-panel glass-panel"
         [class.open]="isOpen"
         [class.hidden]="!shouldShow"
         *ngIf="shouldShow">
      <div class="header" (click)="toggleOpen()">
        <div class="title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10"></polyline>
            <polyline points="1 20 1 14 7 14"></polyline>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
          </svg>
          Sync Queue
        </div>
        <div class="badge" *ngIf="(queue$ | async)?.length as count">{{ count }}</div>
      </div>

      <div class="content" *ngIf="isOpen">
        <div class="actions">
          <button (click)="forceSync()" class="action-btn" aria-label="Force sync">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"></polyline>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
            </svg>
            Sync Now
          </button>
          <button (click)="clearFailedItems()" class="action-btn secondary" aria-label="Clear failed items">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
            Clear Failed
          </button>
          <button (click)="clearQueue()" class="action-btn warning" aria-label="Clear queue">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear All
          </button>
        </div>

        <div class="queue-list" *ngIf="(queue$ | async) as queue">
          <div *ngIf="queue.length === 0" class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>All synced!</span>
          </div>

          <div class="queue-item" *ngFor="let item of queue">
            <div class="item-header">
              <span class="entity">{{ item.entityType }}</span>
              <span class="operation" [class]="item.action.toLowerCase()">{{ item.action }}</span>
            </div>
            <div class="item-details">
              <span>ID: {{ item.id.substring(0,8) }}...</span>
              <span>Retries: {{ item.retryCount || 0 }}</span>
              <span class="status" [class]="item.status.toLowerCase()">{{ item.status }}</span>
            </div>
            <div class="item-error" *ngIf="item.lastError">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ item.lastError }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync-queue-panel {
      position: fixed;
      bottom: 100px;
      right: 1rem;
      width: 340px;
      background: var(--glass-bg);
      border-radius: var(--radius-lg);
      box-shadow: var(--glass-shadow-hover);
      border: 1px solid var(--glass-border);
      backdrop-filter: var(--glass-blur);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all var(--transition-base);
      max-height: 56px;

      &.hidden {
        opacity: 0;
        pointer-events: none;
        transform: translateX(400px);
      }

      &.open {
        max-height: 600px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      }
    }

    .header {
      padding: 1rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      background: var(--glass-bg-light);
      user-select: none;
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-lighter);
      }

      .title {
        display: flex;
        align-items: center;
        gap: 0.625rem;
        font-weight: 600;
        color: var(--color-text-primary);
        font-size: 0.95rem;

        svg {
          color: var(--color-accent-primary);
          animation: pulse 2s ease-in-out infinite;
        }
      }

      .badge {
        background: var(--gradient-primary);
        color: white;
        border-radius: var(--radius-full);
        padding: 0.25rem 0.75rem;
        font-size: 0.8rem;
        font-weight: 700;
        box-shadow: 0 0 16px rgba(14, 165, 233, 0.5);
        animation: pulse 2s ease-in-out infinite;
      }
    }

    .content {
      padding: 1rem 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      border-top: 1px solid var(--glass-border);
      overflow-y: auto;
      max-height: 500px;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;

      .action-btn {
        flex: 1;
        min-width: 100px;
        padding: 0.625rem 1rem;
        border-radius: var(--radius-md);
        border: none;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-base);
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;

        &:first-child {
          background: rgba(14, 165, 233, 0.15);
          color: var(--color-accent-primary);
          border: 1px solid rgba(14, 165, 233, 0.3);

          &:hover {
            background: rgba(14, 165, 233, 0.25);
            box-shadow: 0 0 16px rgba(14, 165, 233, 0.3);
          }
        }

        &.secondary {
          background: rgba(251, 191, 36, 0.15);
          color: #f59e0b;
          border: 1px solid rgba(251, 191, 36, 0.3);

          &:hover {
            background: rgba(251, 191, 36, 0.25);
            box-shadow: 0 0 16px rgba(251, 191, 36, 0.3);
          }
        }

        &.warning {
          background: rgba(239, 68, 68, 0.15);
          color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.3);

          &:hover {
            background: rgba(239, 68, 68, 0.25);
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.3);
          }
        }
      }
    }

    .queue-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .empty-state {
      text-align: center;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      padding: 2rem 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;

      svg {
        width: 48px;
        height: 48px;
        color: var(--color-status-success);
        filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.5));
      }
    }

    .queue-item {
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      padding: 0.875rem;
      border: 1px solid var(--glass-border);
      font-size: 0.85rem;
      transition: all var(--transition-base);
      animation: slideInRight 0.3s ease-out;

      &:hover {
        border-color: var(--glass-border-light);
        transform: translateX(-4px);
      }

      .item-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-weight: 600;

        .entity {
          color: var(--color-text-primary);
          font-size: 0.9rem;
        }

        .operation {
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-sm);
          background: var(--glass-bg);
          text-transform: uppercase;
          letter-spacing: 0.5px;

          &.update {
            background: rgba(14, 165, 233, 0.15);
            color: var(--color-accent-primary);
            border: 1px solid rgba(14, 165, 233, 0.3);
          }

          &.create {
            background: rgba(16, 185, 129, 0.15);
            color: var(--color-status-success);
            border: 1px solid rgba(16, 185, 129, 0.3);
          }

          &.delete {
            background: rgba(239, 68, 68, 0.15);
            color: #ef4444;
            border: 1px solid rgba(239, 68, 68, 0.3);
          }
        }
      }

      .item-details {
        display: flex;
        justify-content: space-between;
        color: var(--color-text-tertiary);
        font-size: 0.75rem;
        font-family: var(--font-mono);

        .status {
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;

          &.pending {
            color: var(--color-status-warning);
          }

          &.processing {
            color: var(--color-status-info);
          }

          &.failed {
            color: var(--color-status-error);
          }
        }
      }

      .item-error {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin-top: 8px;
        padding: 8px;
        background: rgba(239, 68, 68, 0.1);
        border-radius: var(--radius-sm);
        border: 1px solid rgba(239, 68, 68, 0.2);
        font-size: 0.75rem;
        color: #ef4444;
        line-height: 1.4;

        svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        span {
          word-break: break-word;
        }
      }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(20px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class SyncQueueViewerComponent {
  private queueRepo = inject(SyncQueueRepository);
  private syncService = inject(SyncService);

  queue$ = this.queueRepo.syncQueue$;
  isOpen = false;

  // Show only when there are items in the queue or in debug mode
  get shouldShow(): boolean {
    // Check for debug mode via localStorage or environment
    const debugMode = localStorage.getItem('sync-queue-debug') === 'true';
    return debugMode;
  }

  toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  forceSync() {
    console.log('Force sync triggered');
    this.syncService.triggerSync();
  }

  async clearQueue() {
    const confirmed = confirm('Are you sure you want to clear all sync queue items? This cannot be undone.');
    if (!confirmed) return;

    await this.queueRepo.saveAll([]);
    console.log('Queue cleared');
  }

  async clearFailedItems() {
    const queue = await this.queueRepo.getAll();
    const nonFailedItems = queue.filter(item => item.status !== 'FAILED');
    await this.queueRepo.saveAll(nonFailedItems);
    console.log('Failed items cleared');
  }
}
