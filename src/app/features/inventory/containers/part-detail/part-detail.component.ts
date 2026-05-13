import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, switchMap, tap } from 'rxjs';
import { Location } from '@angular/common';

import { InventoryService } from '../../../../core/services/inventory.service';
import { Part, StockLevel } from '../../../../core/models/inventory.model';
import { StockLevelIndicatorComponent } from '../../components/stock-level-indicator/stock-level-indicator.component';

@Component({
  selector: 'app-part-detail',
  standalone: true,
  imports: [CommonModule, StockLevelIndicatorComponent],
  template: `
    <div class="detail-layout fade-in" *ngIf="part$ | async as part">
      
      <!-- Top Navigation -->
      <div class="nav-bar">
        <button class="btn-back" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Catalog
        </button>
      </div>

      <div class="content-grid">
        <!-- Left Column: Image and Primary Details -->
        <div class="main-info glass-panel">
          <div class="image-container">
            <img *ngIf="part.photoUrl; else placeholder" [src]="part.photoUrl" [alt]="part.name" />
            <ng-template #placeholder>
              <div class="placeholder-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
            </ng-template>
          </div>
          
          <div class="info-header">
            <div class="title-row">
              <h1 class="part-name">{{ part.name }}</h1>
              <span class="price">\${{ part.unitPrice | number:'1.2-2' }}</span>
            </div>
            <div class="meta-row">
              <span class="part-number">#{{ part.partNumber }}</span>
              <span class="category">{{ part.category }}</span>
              <app-stock-level-indicator 
                [quantity]="totalStock" 
                [minStockLevel]="part.minStockLevel"
                [showQuantity]="true">
              </app-stock-level-indicator>
            </div>
          </div>

          <div class="description-block">
            <h3>Description</h3>
            <p>{{ part.description }}</p>
          </div>

          <div class="tags-block" *ngIf="part.tags?.length">
            <h3>Tags</h3>
            <div class="tags-container">
              <span class="tag" *ngFor="let tag of part.tags">{{ tag }}</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Stock Locations and Actions -->
        <div class="side-info">
          
          <!-- Actions Panel -->
          <div class="action-panel glass-panel">
            <h3>Actions</h3>
            <p class="action-subtitle">Add this part to your checkout cart to reserve it from the warehouse.</p>
            
            <button class="btn-primary" [disabled]="totalStock <= 0">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              Add to Cart
            </button>
            <button class="btn-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              View Compatibility
            </button>
          </div>

          <!-- Stock Locations -->
          <div class="stock-panel glass-panel">
            <h3>Stock Locations</h3>
            <div class="stock-list" *ngIf="stockLevels$ | async as stocks">
              <div class="stock-item" *ngFor="let stock of stocks">
                <div class="location-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </div>
                <div class="location-details">
                  <span class="loc-name">{{ stock.locationId }}</span> <!-- Should resolve name -->
                  <span class="loc-qty" [class.low-qty]="stock.availableQuantity < part.minStockLevel">
                    {{ stock.availableQuantity }} Available
                  </span>
                </div>
              </div>
              <div *ngIf="stocks.length === 0" class="no-stock">
                No stock recorded.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-layout {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-bar {
      margin-bottom: 20px;
    }

    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      font-size: 0.95rem;
      cursor: pointer;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-text-primary);
      }
    }

    .content-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    /* Main Info Panel */
    .main-info {
      padding: 24px;
      border-radius: var(--radius-xl);
    }

    .image-container {
      width: 100%;
      height: 300px;
      border-radius: var(--radius-lg);
      overflow: hidden;
      margin-bottom: 24px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .placeholder-box {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--color-text-secondary);
        opacity: 0.3;

        svg {
          width: 64px;
          height: 64px;
        }
      }
    }

    .info-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--glass-border);
    }

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;

      .part-name {
        font-size: 2rem;
        margin: 0;
        color: var(--color-text-primary);
        font-weight: 700;
      }

      .price {
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--color-accent-primary);
      }
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 16px;

      .part-number {
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--color-text-secondary);
        background: var(--glass-bg-dark);
        padding: 4px 8px;
        border-radius: 4px;
        border: 1px solid var(--glass-border);
      }

      .category {
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--color-text-secondary);
      }
    }

    h3 {
      font-size: 1.1rem;
      margin: 0 0 12px 0;
      color: var(--color-text-primary);
    }

    .description-block {
      margin-bottom: 24px;
      
      p {
        color: var(--color-text-secondary);
        line-height: 1.6;
      }
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;

      .tag {
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-accent-primary);
        padding: 4px 12px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        border: 1px solid rgba(14, 165, 233, 0.2);
      }
    }

    /* Side Info */
    .side-info {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .action-panel, .stock-panel {
      padding: 24px;
      border-radius: var(--radius-xl);
    }

    .action-subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin-bottom: 20px;
      line-height: 1.4;
    }

    .btn-primary, .btn-secondary {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      margin-bottom: 12px;

      svg {
        width: 18px;
        height: 18px;
      }
    }

    .btn-primary {
      background: var(--color-accent-primary);
      color: white;
      border: none;
      box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        box-shadow: none;
      }
    }

    .btn-secondary {
      background: transparent;
      color: var(--color-text-primary);
      border: 1px solid var(--glass-border);

      &:hover {
        background: var(--glass-bg-light);
      }
    }

    .stock-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .stock-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--glass-bg-dark);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      .location-icon {
        color: var(--color-text-secondary);
        svg { width: 20px; height: 20px; }
      }

      .location-details {
        display: flex;
        flex-direction: column;
        
        .loc-name {
          font-weight: 500;
          color: var(--color-text-primary);
          font-size: 0.95rem;
        }

        .loc-qty {
          font-size: 0.85rem;
          color: var(--color-status-success);

          &.low-qty {
            color: var(--color-status-warning);
          }
        }
      }
    }

    .no-stock {
      color: var(--color-text-secondary);
      font-style: italic;
      font-size: 0.9rem;
    }
  `]
})
export class PartDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private inventoryService = inject(InventoryService);

  part$!: Observable<Part | undefined>;
  stockLevels$!: Observable<StockLevel[]>;
  totalStock: number = 0;

  ngOnInit() {
    this.part$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        if (!id) throw new Error('No part ID provided');
        
        this.stockLevels$ = this.inventoryService.getStockByPart(id).pipe(
          tap(stocks => {
            this.totalStock = stocks.reduce((sum, stock) => sum + stock.availableQuantity, 0);
          })
        );
        
        return this.inventoryService.getPartById(id);
      })
    );
  }

  goBack() {
    this.location.back();
  }
}
