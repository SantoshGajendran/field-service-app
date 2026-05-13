import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Part, StockLevel } from '../../../../core/models/inventory.model';
import { StockLevelIndicatorComponent } from '../stock-level-indicator/stock-level-indicator.component';
import { HapticService } from '../../../../core/services/haptic.service';

@Component({
  selector: 'app-part-card',
  standalone: true,
  imports: [CommonModule, StockLevelIndicatorComponent],
  template: `
    <div class="part-card glass-panel" (click)="onClick()">
      <!-- Card Image/Thumbnail Area -->
      <div class="part-image">
        <img *ngIf="part.photoUrl; else placeholder" [src]="part.photoUrl" [alt]="part.name" />
        <ng-template #placeholder>
          <div class="image-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
        </ng-template>
      </div>

      <!-- Card Content Area -->
      <div class="part-content">
        <div class="part-header">
          <h3 class="part-name">{{ part.name }}</h3>
          <span class="part-number">{{ part.partNumber }}</span>
        </div>

        <p class="part-description">{{ part.description | slice:0:60 }}{{ part.description.length > 60 ? '...' : '' }}</p>
        
        <div class="part-meta">
          <span class="category-badge">{{ part.category }}</span>
          <span class="price">\${{ part.unitPrice | number:'1.2-2' }}</span>
        </div>

        <div class="part-footer">
          <app-stock-level-indicator 
            [quantity]="getTotalStock()" 
            [minStockLevel]="part.minStockLevel"
            [showQuantity]="true">
          </app-stock-level-indicator>
          
          <button class="btn-icon" (click)="onAddClick($event)" aria-label="Add to cart">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .part-card {
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all var(--transition-base);
      height: 100%;
      min-height: 380px;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
    }

    .part-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--neon-primary);
      border-color: var(--color-accent-primary);
    }

    .part-image {
      height: 160px;
      width: 100%;
      background: rgba(0, 0, 0, 0.2);
      border-bottom: 1px solid var(--glass-border);
      flex-shrink: 0;
      overflow: hidden;
      
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform var(--transition-base);
      }
    }

    .part-card:hover .part-image img {
      transform: scale(1.05);
    }

    .image-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-text-secondary);
      background: linear-gradient(135deg, var(--glass-bg-dark) 0%, var(--glass-bg) 100%);
      
      svg {
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }
    }

    .part-content {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex: 1;
      gap: 8px;
    }

    .part-header {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .part-name {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0;
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .part-number {
      font-size: 0.75rem;
      font-family: var(--font-mono);
      color: var(--color-accent-secondary);
      background: rgba(245, 158, 11, 0.15);
      padding: 3px 8px;
      border-radius: 4px;
      width: fit-content;
    }

    .part-description {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin: 0;
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .part-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid var(--glass-border);
      margin-top: auto;
    }

    .category-badge {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--color-text-tertiary);
      font-weight: 500;
    }

    .price {
      font-size: 1rem;
      font-weight: 700;
      color: var(--color-text-primary);
    }

    .part-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
    }

    .btn-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border-radius: var(--radius-md);
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.4);
      color: var(--color-accent-primary);
      cursor: pointer;
      transition: all var(--transition-base);

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: var(--color-accent-primary);
        color: #fff;
        box-shadow: 0 0 15px rgba(14, 165, 233, 0.5);
        transform: scale(1.05);
      }
    }

    @media (max-width: 768px) {
      .part-card {
        min-height: 320px;
      }

      .part-image {
        height: 140px;
      }

      .part-content {
        padding: 12px;
      }
    }
  `]
})
export class PartCardComponent {
  private haptic = inject(HapticService);
  
  @Input({ required: true }) part!: Part;
  @Input() stockLevels: StockLevel[] = [];
  
  @Output() cardClick = new EventEmitter<Part>();
  @Output() addToCart = new EventEmitter<Part>();

  getTotalStock(): number {
    if (!this.stockLevels || this.stockLevels.length === 0) {
      return 0;
    }
    return this.stockLevels.reduce((total, stock) => total + stock.availableQuantity, 0);
  }

  onClick() {
    this.haptic.light();
    this.cardClick.emit(this.part);
  }

  onAddClick(event: Event) {
    event.stopPropagation();
    this.haptic.medium();
    this.addToCart.emit(this.part);
  }
}
