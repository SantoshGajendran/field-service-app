import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WorkOrderRepository } from '../../../../core/repositories/work-order.repository';
import { WorkOrderCardComponent } from '../../components/work-order-card/work-order-card.component';
import { WorkOrder } from '../../../../core/models/work-order.model';
import { HapticService } from '../../../../core/services/haptic.service';
import { map } from 'rxjs/operators';
import { BehaviorSubject, combineLatest } from 'rxjs';

@Component({
  selector: 'app-work-order-list',
  standalone: true,
  imports: [CommonModule, WorkOrderCardComponent],
  template: `
    <!-- Pull to Refresh Indicator -->
    <div class="pull-to-refresh-indicator" [class.visible]="pullDistance > 0" [style.transform]="'translateY(' + Math.min(pullDistance, 80) + 'px)'">
      <div class="refresh-spinner" [class.spinning]="isRefreshing">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
      </div>
      <span class="refresh-text">{{ isRefreshing ? 'Refreshing...' : (pullDistance > 60 ? 'Release to refresh' : 'Pull to refresh') }}</span>
    </div>

    <div class="list-header fade-in">
      <div class="header-content">
        <h1 class="page-title neon-text-primary">Assigned Tasks</h1>
        <p class="subtitle">Manage your field service operations</p>
      </div>
      <div class="filter-controls">
        <button
          class="filter-btn"
          [class.active]="selectedFilter === 'ALL'"
          (click)="setFilter('ALL')"
          aria-label="Show all tasks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="4" y1="21" x2="4" y2="14"></line>
            <line x1="4" y1="10" x2="4" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12" y2="3"></line>
            <line x1="20" y1="21" x2="20" y2="16"></line>
            <line x1="20" y1="12" x2="20" y2="3"></line>
          </svg>
          All
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedFilter === 'OPEN'"
          (click)="setFilter('OPEN')"
          aria-label="Show open tasks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
          Open
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedFilter === 'IN_PROGRESS'"
          (click)="setFilter('IN_PROGRESS')"
          aria-label="Show in progress tasks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M2 12h20"></path>
          </svg>
          Active
        </button>
        <button
          class="filter-btn"
          [class.active]="selectedFilter === 'COMPLETED'"
          (click)="setFilter('COMPLETED')"
          aria-label="Show completed tasks">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          Done
        </button>
      </div>
    </div>

    <div class="search-bar glass-panel fade-in">
      <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
      <input
        type="text"
        placeholder="Search by ID, equipment, or description..."
        class="search-input"
        aria-label="Search work orders"
        (input)="onSearchChange($event)"
        [value]="searchTerm"
      />
      <button
        *ngIf="searchTerm"
        class="clear-search-btn"
        (click)="clearSearch()"
        aria-label="Clear search">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>

    <div class="list-container"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()">

      <!-- Loading Skeleton -->
      <ng-container *ngIf="isLoading">
        <div class="skeleton-card glass-panel" *ngFor="let item of [1,2,3,4,5]">
          <div class="skeleton-header">
            <div class="skeleton-badge"></div>
            <div class="skeleton-status"></div>
          </div>
          <div class="skeleton-title"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text short"></div>
          <div class="skeleton-footer">
            <div class="skeleton-icon"></div>
            <div class="skeleton-icon"></div>
            <div class="skeleton-icon"></div>
          </div>
        </div>
      </ng-container>

      <!-- Actual Content -->
      <ng-container *ngIf="!isLoading && (filteredWorkOrders$ | async) as workOrders">
      <ng-container *ngIf="workOrders.length > 0; else emptyState">
        <div class="stats-bar glass-panel fade-in">
          <div class="stat-item">
            <span class="stat-value">{{ allWorkOrders.length }}</span>
            <span class="stat-label">Total</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ getStatusCount(allWorkOrders, 'OPEN') }}</span>
            <span class="stat-label">Open</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ getStatusCount(allWorkOrders, 'IN_PROGRESS') }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-value">{{ getStatusCount(allWorkOrders, 'COMPLETED') }}</span>
            <span class="stat-label">Done</span>
          </div>
        </div>

        <app-work-order-card
          *ngFor="let wo of workOrders; trackBy: trackByWorkOrderId"
          [workOrder]="wo"
          (cardClick)="onWorkOrderClick($event)">
        </app-work-order-card>
      </ng-container>

      <ng-template #emptyState>
        <div class="empty-state glass-panel fade-in">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
          </div>
          <h3>All Caught Up!</h3>
          <p>No tasks match your current filter.</p>
          <div class="empty-actions">
            <button class="action-btn primary" (click)="clearFilters()" *ngIf="selectedFilter !== 'ALL' || searchTerm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"></polyline>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
              </svg>
              Clear Filters
            </button>
            <button class="action-btn secondary" (click)="refreshData()">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"></polyline>
                <polyline points="1 20 1 14 7 14"></polyline>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </ng-template>
    </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .pull-to-refresh-indicator {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 80px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: var(--glass-bg);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--glass-border);
      z-index: 1000;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      transform: translateY(-100%);
    }

    .pull-to-refresh-indicator.visible {
      opacity: 1;
    }

    .refresh-spinner {
      width: 32px;
      height: 32px;
      color: var(--color-accent-primary);
    }

    .refresh-spinner.spinning svg {
      animation: spin 1s linear infinite;
    }

    .refresh-text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-content {
      flex: 1;
      min-width: 200px;
    }

    .page-title {
      font-size: 1.75rem;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .filter-controls {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      color: var(--color-text-secondary);
      padding: 12px 20px;
      min-height: 48px;
      border-radius: var(--radius-full);
      font-size: 0.8rem;
      font-weight: 600;
      transition: all var(--transition-base);
      backdrop-filter: var(--glass-blur);

      svg {
        width: 16px;
        height: 16px;
        transition: transform var(--transition-base);
      }

      &:hover {
        background: var(--glass-bg-light);
        border-color: var(--glass-border-light);
        transform: translateY(-2px);
      }

      &.active {
        background: rgba(14, 165, 233, 0.2);
        color: var(--color-accent-primary);
        border-color: rgba(14, 165, 233, 0.4);
        box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);

        svg {
          transform: scale(1.1);
        }
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      margin-bottom: 20px;
      transition: all var(--transition-base);

      &:focus-within {
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.2), var(--glass-shadow-hover);
      }
    }

    .search-icon {
      color: var(--color-text-secondary);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      background: transparent;
      border: none;
      outline: none;
      color: var(--color-text-primary);
      font-size: 0.95rem;
      font-family: var(--font-family);

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    .clear-search-btn {
      flex-shrink: 0;
      min-width: 44px;
      min-height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      color: var(--color-text-tertiary);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-text-primary);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .stats-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 16px;
      margin-bottom: 20px;
      gap: 12px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      text-shadow: 0 0 10px rgba(14, 165, 233, 0.5);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .stat-divider {
      width: 1px;
      height: 40px;
      background: var(--glass-border);
    }

    .list-container {
      animation: fadeIn 0.6s ease-out;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
      color: var(--color-text-secondary);
      min-height: 400px;

      .empty-icon {
        width: 80px;
        height: 80px;
        margin-bottom: 24px;
        padding: 20px;
        background: var(--glass-bg-light);
        border-radius: var(--radius-full);
        border: 2px solid var(--glass-border);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: pulse 2s ease-in-out infinite;

        svg {
          width: 100%;
          height: 100%;
          color: var(--color-accent-primary);
          filter: drop-shadow(0 0 10px rgba(14, 165, 233, 0.5));
        }
      }

      h3 {
        color: var(--color-text-primary);
        margin-bottom: 8px;
        font-size: 1.5rem;
      }

      p {
        font-size: 1rem;
        max-width: 300px;
      }

      .empty-actions {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        justify-content: center;
        margin-top: 24px;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        min-height: 48px;
        border: none;
        border-radius: var(--radius-full);
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-base);

        &.primary {
          background: var(--color-accent-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);

          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4);
          }

          &:active {
            transform: translateY(0);
          }
        }

        &.secondary {
          background: var(--glass-bg);
          color: var(--color-text-primary);
          border: 1px solid var(--glass-border);

          &:hover {
            background: var(--glass-bg-light);
            border-color: var(--color-accent-primary);
          }

          &:active {
            transform: scale(0.98);
          }
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }

    /* Skeleton Loading States */
    .skeleton-card {
      padding: 1.5rem;
      margin-bottom: 1rem;
      animation: fadeIn 0.3s ease-out;
    }

    .skeleton-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .skeleton-badge {
      width: 80px;
      height: 24px;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-status {
      width: 60px;
      height: 24px;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-title {
      width: 70%;
      height: 20px;
      border-radius: var(--radius-sm);
      margin-bottom: 0.75rem;
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-text {
      width: 100%;
      height: 16px;
      border-radius: var(--radius-sm);
      margin-bottom: 0.5rem;
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;

      &.short {
        width: 60%;
      }
    }

    .skeleton-footer {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .skeleton-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Landscape Mode Optimization */
    @media (orientation: landscape) and (max-height: 600px) {
      .list-header {
        margin-bottom: 12px;
      }

      .page-title {
        font-size: 1.5rem;
      }

      .filter-controls {
        gap: 6px;
      }

      .filter-btn {
        padding: 8px 16px;
        font-size: 0.75rem;
      }

      .search-bar {
        padding: 10px 16px;
        margin-bottom: 12px;
      }

      .stats-bar {
        padding: 12px;
        margin-bottom: 12px;
      }

      .stat-value {
        font-size: 1.25rem;
      }
    }

    /* Tablet Landscape - Two Column Layout */
    @media (orientation: landscape) and (min-width: 768px) {
      .list-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .stats-bar {
        grid-column: 1 / -1;
      }

      .empty-state {
        grid-column: 1 / -1;
      }
    }
  `]
})
export class WorkOrderListComponent {
  private workOrderRepo = inject(WorkOrderRepository);
  private router = inject(Router);
  private hapticService = inject(HapticService);

  // Filter and search state
  selectedFilter: 'ALL' | WorkOrder['status'] = 'ALL';
  searchTerm = '';
  allWorkOrders: WorkOrder[] = [];

  // Loading state
  isLoading = true;

  // Pull to refresh state
  pullDistance = 0;
  isRefreshing = false;
  private startY = 0;
  private isPulling = false;

  // Expose Math for template
  Math = Math;

  private filterSubject = new BehaviorSubject<'ALL' | WorkOrder['status']>('ALL');
  private searchSubject = new BehaviorSubject<string>('');

  // Combined filtered work orders
  filteredWorkOrders$ = combineLatest([
    this.workOrderRepo.workOrders$,
    this.filterSubject,
    this.searchSubject
  ]).pipe(
    map(([workOrders, filter, search]) => {
      // Hide loading once data arrives
      if (workOrders.length > 0) {
        this.isLoading = false;
      }

      // Store all work orders for stats
      this.allWorkOrders = workOrders;

      let filtered = workOrders;

      // Apply status filter
      if (filter !== 'ALL') {
        filtered = filtered.filter(wo => wo.status === filter);
      }

      // Apply search filter
      if (search.trim()) {
        const searchLower = search.toLowerCase().trim();
        filtered = filtered.filter(wo =>
          wo.id.toLowerCase().includes(searchLower) ||
          wo.equipment_id.toLowerCase().includes(searchLower) ||
          wo.title.toLowerCase().includes(searchLower) ||
          wo.description.toLowerCase().includes(searchLower)
        );
      }

      return filtered;
    })
  );

  async setFilter(filter: 'ALL' | WorkOrder['status']) {
    await this.hapticService.selectionChanged();
    this.selectedFilter = filter;
    this.filterSubject.next(filter);
  }

  onSearchChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    this.searchSubject.next(input.value);
  }

  async clearSearch() {
    await this.hapticService.light();
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  async clearFilters() {
    await this.hapticService.light();
    this.selectedFilter = 'ALL';
    this.filterSubject.next('ALL');
    this.searchTerm = '';
    this.searchSubject.next('');
  }

  async refreshData() {
    await this.hapticService.medium();
    this.isRefreshing = true;
    this.isLoading = true;

    try {
      await this.workOrderRepo.syncWorkOrders();
      await this.hapticService.success();
    } catch (error) {
      console.error('Error refreshing data:', error);
      await this.hapticService.error();
    } finally {
      this.isRefreshing = false;
      // Keep loading state for a moment to show skeleton
      setTimeout(() => {
        this.isLoading = false;
      }, 300);
    }
  }

  // Pull to refresh handlers
  onTouchStart(event: TouchEvent) {
    const container = event.currentTarget as HTMLElement;
    if (container.scrollTop === 0) {
      this.startY = event.touches[0].clientY;
      this.isPulling = true;
    }
  }

  onTouchMove(event: TouchEvent) {
    if (!this.isPulling || this.isRefreshing) return;

    const currentY = event.touches[0].clientY;
    const diff = currentY - this.startY;

    if (diff > 0) {
      this.pullDistance = Math.min(diff * 0.5, 80);

      if (this.pullDistance > 10) {
        event.preventDefault();
      }
    }
  }

  async onTouchEnd() {
    if (!this.isPulling) return;

    this.isPulling = false;

    if (this.pullDistance > 60 && !this.isRefreshing) {
      await this.refreshData();
    }

    this.pullDistance = 0;
  }

  onWorkOrderClick(workOrder: WorkOrder) {
    this.router.navigate(['/work-orders', workOrder.id]);
  }

  getStatusCount(workOrders: WorkOrder[], status: WorkOrder['status']): number {
    return workOrders.filter(wo => wo.status === status).length;
  }

  trackByWorkOrderId(index: number, workOrder: WorkOrder): string {
    return workOrder.id;
  }
}
