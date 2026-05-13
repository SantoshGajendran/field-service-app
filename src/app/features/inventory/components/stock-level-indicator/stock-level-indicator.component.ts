import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

export type StockStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';

@Component({
  selector: 'app-stock-level-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stock-badge" [ngClass]="statusClass">
      <div class="pulse-dot"></div>
      <span class="label">{{ label }}</span>
      <span class="quantity" *ngIf="showQuantity && quantity !== undefined">({{ quantity }})</span>
    </div>
  `,
  styles: [`
    .stock-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      border: 1px solid transparent;
      transition: all var(--transition-base);
    }

    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: currentColor;
    }

    .label {
      line-height: 1;
    }

    .quantity {
      opacity: 0.8;
      font-size: 0.7rem;
    }

    /* Status Colors using the App's Design System */
    .status-in-stock {
      background: rgba(22, 163, 74, 0.15); /* Green */
      color: #4ade80;
      border-color: rgba(74, 222, 128, 0.3);
      box-shadow: 0 0 10px rgba(22, 163, 74, 0.2);

      .pulse-dot {
        animation: neonPulse 2s infinite;
      }
    }

    .status-low-stock {
      background: rgba(217, 119, 6, 0.15); /* Amber */
      color: #fbbf24;
      border-color: rgba(251, 191, 36, 0.3);
      box-shadow: 0 0 10px rgba(217, 119, 6, 0.2);

      .pulse-dot {
        animation: neonPulse 1.5s infinite;
      }
    }

    .status-out-of-stock {
      background: rgba(220, 38, 38, 0.15); /* Red */
      color: #f87171;
      border-color: rgba(248, 113, 113, 0.3);
      box-shadow: 0 0 10px rgba(220, 38, 38, 0.2);
    }

    @keyframes neonPulse {
      0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.4); }
      70% { box-shadow: 0 0 0 4px rgba(14, 165, 233, 0); }
      100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
    }
  `]
})
export class StockLevelIndicatorComponent implements OnChanges {
  @Input() quantity: number = 0;
  @Input() minStockLevel: number = 0;
  @Input() showQuantity: boolean = true;

  statusClass: string = 'status-out-of-stock';
  label: string = 'Out of Stock';

  ngOnChanges() {
    this.updateStatus();
  }

  private updateStatus() {
    if (this.quantity <= 0) {
      this.statusClass = 'status-out-of-stock';
      this.label = 'Out of Stock';
    } else if (this.quantity <= this.minStockLevel) {
      this.statusClass = 'status-low-stock';
      this.label = 'Low Stock';
    } else {
      this.statusClass = 'status-in-stock';
      this.label = 'In Stock';
    }
  }
}
