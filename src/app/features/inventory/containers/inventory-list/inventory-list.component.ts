import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, map, switchMap, tap, delay, startWith } from 'rxjs';

import { InventoryService } from '../../../../core/services/inventory.service';
import { Part, StockLevel, StockLocation } from '../../../../core/models/inventory.model';
import { PartCardComponent } from '../../components/part-card/part-card.component';
import { PartFilterSidebarComponent, PartFilters } from '../../components/part-filter-sidebar/part-filter-sidebar.component';
import { ToastService } from '../../../../core/services/toast.service';
import { HapticService } from '../../../../core/services/haptic.service';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [CommonModule, PartCardComponent, PartFilterSidebarComponent],
  template: `
    <div class="inventory-layout fade-in">
      
      <!-- Top Bar -->
      <div class="page-header glass-panel">
        <div class="header-content">
          <h1 class="page-title neon-text-primary">Inventory Catalog</h1>
          <p class="subtitle">Search, filter, and checkout parts</p>
        </div>
        
        <div class="header-actions">
          <button class="btn-primary" (click)="goToCheckout()" [class.has-items]="cartCount > 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            <span>Checkout</span>
            <span class="cart-badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
          </button>
        </div>
      </div>

      <div class="layout-body">
        <!-- Sidebar -->
        <aside class="sidebar-area">
          <app-part-filter-sidebar 
            [categories]="(categories$ | async) || []"
            [equipmentIds]="(equipmentIds$ | async) || []"
            (filtersChanged)="onFiltersChanged($event)">
          </app-part-filter-sidebar>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Loading Skeleton -->
          <div class="parts-grid" *ngIf="isLoading; else contentArea">
            <div class="skeleton-card glass-panel" *ngFor="let i of [1,2,3,4,5,6]">
              <div class="skeleton-image"></div>
              <div class="skeleton-content">
                <div class="skeleton-title"></div>
                <div class="skeleton-badge"></div>
                <div class="skeleton-text"></div>
                <div class="skeleton-text short"></div>
                <div class="skeleton-footer">
                  <div class="skeleton-indicator"></div>
                  <div class="skeleton-btn"></div>
                </div>
              </div>
            </div>
          </div>

          <ng-template #contentArea>
            <div class="parts-grid" *ngIf="parts$ | async as parts">
              <ng-container *ngIf="parts.length > 0; else noResults">
                <app-part-card
                  *ngFor="let part of parts; let i = index"
                  [part]="part"
                  [stockLevels]="(getStockLevels(part.id) | async) || []"
                  [style.animation-delay]="(i * 50) + 'ms'"
                  class="part-card-animated"
                  (cardClick)="viewPart(part)"
                  (addToCart)="addToCart(part)">
                </app-part-card>
              </ng-container>

              <ng-template #noResults>
                <div class="empty-state glass-panel slide-up">
                  <div class="empty-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                      <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                  </div>
                  <h3>No parts found</h3>
                  <p>Try adjusting your search filters or clear filters to see all parts.</p>
                  <button class="btn-secondary" (click)="clearFilters()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                    Clear Filters
                  </button>
                </div>
              </ng-template>
            </div>
          </ng-template>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .inventory-layout {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 24px;
      height: calc(100vh - 80px);
      overflow: hidden;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 28px;
      border-radius: var(--radius-lg);
      flex-shrink: 0;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-content {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .page-title {
        font-size: 1.75rem;
        margin: 0;
        font-weight: 700;
      }
      .subtitle {
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-accent-primary);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
      white-space: nowrap;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
      }
    }

    .cart-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 22px;
      height: 22px;
      padding: 0 6px;
      background: var(--color-accent-secondary);
      color: #000;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .layout-body {
      display: flex;
      gap: 24px;
      flex: 1;
      overflow: hidden;
      min-height: 0;
    }

    .sidebar-area {
      width: 280px;
      flex-shrink: 0;
      overflow-y: auto;
      height: 100%;
      
      &::-webkit-scrollbar {
        width: 6px;
      }
      
      &::-webkit-scrollbar-track {
        background: transparent;
      }
      
      &::-webkit-scrollbar-thumb {
        background: var(--glass-border);
        border-radius: var(--radius-full);
      }
    }

    .main-content {
      flex: 1;
      overflow-y: auto;
      padding-right: 8px;
      min-height: 0;
    }

    .parts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      padding-bottom: 40px;
    }

    .empty-state, .loading-state {
      grid-column: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      min-height: 400px;
      border-radius: var(--radius-lg);

      svg {
        width: 64px;
        height: 64px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        color: var(--color-text-primary);
        font-size: 1.25rem;
        margin-bottom: 8px;
      }

      p {
        color: var(--color-text-secondary);
      }
    }

    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(14, 165, 233, 0.2);
      border-left-color: var(--color-accent-primary);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-bottom: 16px;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    /* Skeleton Loading */
    .skeleton-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
    }

    .skeleton-image {
      height: 160px;
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .skeleton-title {
      width: 70%;
      height: 20px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-badge {
      width: 60px;
      height: 20px;
      border-radius: 4px;
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-text {
      width: 100%;
      height: 14px;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;

      &.short {
        width: 50%;
      }
    }

    .skeleton-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 1px solid var(--glass-border);
    }

    .skeleton-indicator {
      width: 80px;
      height: 24px;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    .skeleton-btn {
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: linear-gradient(90deg, var(--glass-bg) 25%, var(--glass-bg-light) 50%, var(--glass-bg) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    /* Part Card Animated Entry */
    .part-card-animated {
      animation: cardFadeIn 0.4s ease-out both;
    }

    @keyframes cardFadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Improved Empty State */
    .empty-state {
      .empty-icon {
        width: 100px;
        height: 100px;
        margin-bottom: 24px;
        padding: 24px;
        background: linear-gradient(135deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1));
        border-radius: var(--radius-full);
        border: 2px solid rgba(14, 165, 233, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        animation: float 3s ease-in-out infinite;

        svg {
          width: 48px;
          height: 48px;
          color: var(--color-accent-primary);
          filter: drop-shadow(0 0 15px rgba(14, 165, 233, 0.5));
        }
      }

      h3 {
        color: var(--color-text-primary);
        font-size: 1.5rem;
        margin-bottom: 12px;
      }

      p {
        color: var(--color-text-secondary);
        font-size: 1rem;
        max-width: 320px;
        margin-bottom: 24px;
      }

      .btn-secondary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        background: transparent;
        border: 1px solid var(--color-accent-primary);
        color: var(--color-accent-primary);
        border-radius: var(--radius-md);
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--transition-base);

        svg {
          width: 18px;
          height: 18px;
          margin: 0;
        }

        &:hover {
          background: rgba(14, 165, 233, 0.1);
          box-shadow: 0 0 20px rgba(14, 165, 233, 0.3);
        }

        &:active {
          transform: scale(0.98);
        }
      }
    }

    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }

    .slide-up {
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Button has items */
    .btn-primary.has-items {
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.4);
      
      .cart-badge {
        animation: pulse 2s ease-in-out infinite;
      }
    }

    @media (max-width: 768px) {
      .inventory-layout {
        padding: 16px;
        height: auto;
        overflow: visible;
      }

      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
        padding: 16px;
      }

      .header-actions {
        width: 100%;
      }

      .btn-primary {
        width: 100%;
        justify-content: center;
      }

      .layout-body {
        flex-direction: column;
        overflow: visible;
      }

      .sidebar-area {
        width: 100%;
        height: auto;
        max-height: 400px;
      }

      .parts-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class InventoryListComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private haptic = inject(HapticService);

  filters$ = new BehaviorSubject<PartFilters | undefined>(undefined);
  cartItems: Part[] = [];
  cartCount = 0;
  isLoading = true;
  
  parts$!: Observable<Part[]>;
  categories$!: Observable<string[]>;
  equipmentIds$!: Observable<string[]>;

  ngOnInit() {
    this.categories$ = this.inventoryService.getCategories();
    this.equipmentIds$ = new BehaviorSubject<string[]>(['HVAC-100', 'HVAC-200', 'PLMB-10', 'ELEC-50']).asObservable();

    // Simulate initial loading
    setTimeout(() => { this.isLoading = false; }, 800);

    this.parts$ = this.filters$.pipe(
      switchMap(filters => this.inventoryService.searchParts(filters?.query || '', filters))
    );
  }

  onFiltersChanged(filters: PartFilters) {
    this.filters$.next(filters);
  }

  getStockLevels(partId: string): Observable<StockLevel[]> {
    return this.inventoryService.getStockByPart(partId);
  }

  viewPart(part: Part) {
    this.haptic.light();
    this.router.navigate(['/inventory/part', part.id]);
  }

  addToCart(part: Part) {
    const existingIndex = this.cartItems.findIndex(p => p.id === part.id);
    if (existingIndex === -1) {
      this.cartItems.push(part);
      this.cartCount = this.cartItems.length;
      this.haptic.success();
      this.toastService.success(`${part.name} added to cart`);
    } else {
      this.haptic.light();
      this.toastService.info(`${part.name} already in cart`);
    }
  }

  goToCheckout() {
    this.haptic.light();
    this.router.navigate(['/inventory/checkout']);
  }

  async clearFilters() {
    await this.haptic.light();
    this.filters$.next({ query: '', category: '' });
  }
}
