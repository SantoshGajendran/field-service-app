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
    </div>

    <div class="list-container" *ngIf="filteredWorkOrders$ | async as workOrders">
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
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
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

  private filterSubject = new BehaviorSubject<'ALL' | WorkOrder['status']>('ALL');
  private searchSubject = new BehaviorSubject<string>('');

  // Combined filtered work orders
  filteredWorkOrders$ = combineLatest([
    this.workOrderRepo.workOrders$,
    this.filterSubject,
    this.searchSubject
  ]).pipe(
    map(([workOrders, filter, search]) => {
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
