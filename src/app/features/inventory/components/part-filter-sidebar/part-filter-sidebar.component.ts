import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HapticService } from '../../../../core/services/haptic.service';

export interface PartFilters {
  query: string;
  category: string;
  equipmentId?: string;
  minPrice?: number;
  maxPrice?: number;
}

@Component({
  selector: 'app-part-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="sidebar glass-panel">
      <div class="sidebar-header">
        <h2>Filters</h2>
        <button class="btn-clear" (click)="clearFilters()" *ngIf="hasActiveFilters()">
          Clear
        </button>
      </div>

      <div class="filter-section">
        <label>Search</label>
        <div class="search-input-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            [(ngModel)]="filters.query" 
            (ngModelChange)="onFilterChange()"
            placeholder="Name, Part #, Tag..."
            class="form-control"
          />
        </div>
      </div>

      <div class="filter-section">
        <label>Category</label>
        <select 
          [(ngModel)]="filters.category" 
          (ngModelChange)="onFilterChange()"
          class="form-control">
          <option value="">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
      </div>

      <!-- Price Range -->
      <div class="filter-section">
        <label>Price Range</label>
        <div class="price-range">
          <input 
            type="number" 
            [(ngModel)]="filters.minPrice" 
            (ngModelChange)="onFilterChange()"
            placeholder="Min"
            class="form-control price-input"
          />
          <span class="price-separator">-</span>
          <input 
            type="number" 
            [(ngModel)]="filters.maxPrice" 
            (ngModelChange)="onFilterChange()"
            placeholder="Max"
            class="form-control price-input"
          />
        </div>
      </div>

      <div class="filter-section" *ngIf="equipmentIds.length > 0">
        <label>Equipment Compatibility</label>
        <select 
          [(ngModel)]="filters.equipmentId" 
          (ngModelChange)="onFilterChange()"
          class="form-control">
          <option value="">Any Equipment</option>
          <option *ngFor="let eq of equipmentIds" [value]="eq">{{ eq }}</option>
        </select>
      </div>
    </div>
  `,
  styles: [`
    .sidebar {
      padding: 20px;
      border-radius: var(--radius-lg);
      height: 100%;
      min-width: 260px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);
      flex-shrink: 0;

      h2 {
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
        color: var(--color-text-primary);
      }
    }

    .btn-clear {
      background: transparent;
      border: none;
      color: var(--color-accent-primary);
      font-size: 0.8rem;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      font-weight: 500;

      &:hover {
        background: rgba(14, 165, 233, 0.15);
      }
    }

    .filter-section {
      display: flex;
      flex-direction: column;
      gap: 8px;

      > label {
        font-size: 0.8rem;
        color: var(--color-text-secondary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .search-input-wrapper {
      position: relative;

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: var(--color-text-secondary);
        pointer-events: none;
      }

      input {
        padding-left: 38px;
      }
    }

    .form-control {
      width: 100%;
      padding: 12px 14px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 0.9rem;
      transition: all var(--transition-base);

      &:focus {
        outline: none;
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }

      &::placeholder {
        color: var(--color-text-tertiary);
      }
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;
      cursor: pointer;

      option {
        background: var(--color-bg-secondary);
        color: var(--color-text-primary);
        padding: 8px;
      }
    }

    .price-range {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 12px;
    }

    .price-input {
      flex: 1;
      width: 0;
      height: 44px;
      padding: 12px 14px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 0.9rem;
      transition: all var(--transition-base);
      box-sizing: border-box;

      &:focus {
        outline: none;
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.15);
      }

      &::placeholder {
        color: var(--color-text-tertiary);
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }

      &[type=number] {
        -moz-appearance: textfield;
      }
    }

    .price-separator {
      flex: 0 0 auto;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      user-select: none;
    }

    @media (max-width: 768px) {
      .sidebar {
        min-width: 100%;
      }

      .price-range {
        gap: 8px;
      }

      .price-input {
        height: 40px;
        padding: 10px 12px;
      }

      .price-range {
        flex-wrap: wrap;
      }
    }
  `]
})
export class PartFilterSidebarComponent {
  private haptic = inject(HapticService);
  
  @Input() categories: string[] = [];
  @Input() equipmentIds: string[] = [];
  
  @Output() filtersChanged = new EventEmitter<PartFilters>();

  filters: PartFilters = {
    query: '',
    category: ''
  };

  onFilterChange() {
    this.haptic.selectionChanged();
    this.filtersChanged.emit({ ...this.filters });
  }

  hasActiveFilters(): boolean {
    return !!(this.filters.query || this.filters.category || this.filters.equipmentId || this.filters.minPrice || this.filters.maxPrice);
  }

  async clearFilters() {
    await this.haptic.light();
    this.filters = {
      query: '',
      category: ''
    };
    this.onFilterChange();
  }
}
