import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CartItem {
  partId: string;
  name: string;
  partNumber: string;
  quantity: number;
  maxAvailable: number;
  unitPrice: number;
}

@Component({
  selector: 'app-checkout-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-panel glass-panel">
      <div class="cart-header">
        <h2>Checkout Cart</h2>
        <span class="item-count">{{ items.length }} items</span>
      </div>

      <div class="cart-body">
        <div *ngIf="items.length === 0" class="empty-cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          <p>Your cart is empty.</p>
        </div>

        <div class="cart-items" *ngIf="items.length > 0">
          <div class="cart-item" *ngFor="let item of items">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <span class="part-no">#{{ item.partNumber }}</span>
            </div>
            
            <div class="item-actions">
              <div class="quantity-controls">
                <button class="btn-qty" (click)="updateQty(item, -1)" [disabled]="item.quantity <= 1">-</button>
                <span class="qty-display">{{ item.quantity }}</span>
                <button class="btn-qty" (click)="updateQty(item, 1)" [disabled]="item.quantity >= item.maxAvailable">+</button>
              </div>
              <button class="btn-remove" (click)="removeItem(item.partId)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="cart-footer" *ngIf="items.length > 0">
        <div class="total-row">
          <span>Estimated Value:</span>
          <span class="total-value">\${{ getTotalValue() | number:'1.2-2' }}</span>
        </div>
        <button class="btn-checkout" (click)="onCheckout()">
          Proceed to Checkout
        </button>
      </div>
    </div>
  `,
  styles: [`
    .cart-panel {
      display: flex;
      flex-direction: column;
      height: 100%;
      border-radius: var(--radius-lg);
      overflow: hidden;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
    }

    .cart-header {
      padding: 20px;
      border-bottom: 1px solid var(--glass-border);
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        font-size: 1.25rem;
        color: var(--color-text-primary);
      }

      .item-count {
        background: rgba(14, 165, 233, 0.15);
        color: var(--color-accent-primary);
        padding: 4px 10px;
        border-radius: var(--radius-full);
        font-size: 0.8rem;
        font-weight: 600;
      }
    }

    .cart-body {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
    }

    .empty-cart {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--color-text-secondary);
      opacity: 0.7;

      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }
    }

    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      .item-info {
        h4 {
          margin: 0 0 4px 0;
          font-size: 0.95rem;
          color: var(--color-text-primary);
        }
        .part-no {
          font-size: 0.8rem;
          color: var(--color-text-secondary);
          font-family: monospace;
        }
      }
    }

    .item-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--glass-bg-dark);
      padding: 4px;
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      .btn-qty {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        color: var(--color-text-primary);
        cursor: pointer;
        border-radius: 4px;

        &:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
        }
        &:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
      }

      .qty-display {
        font-weight: 600;
        min-width: 20px;
        text-align: center;
      }
    }

    .btn-remove {
      background: transparent;
      border: none;
      color: var(--color-status-danger);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      opacity: 0.7;
      transition: opacity var(--transition-base);

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        opacity: 1;
        background: rgba(239, 68, 68, 0.1);
      }
    }

    .cart-footer {
      padding: 20px;
      border-top: 1px solid var(--glass-border);
      background: rgba(0, 0, 0, 0.2);

      .total-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        color: var(--color-text-primary);

        .total-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-accent-primary);
        }
      }
    }

    .btn-checkout {
      width: 100%;
      background: var(--color-accent-primary);
      color: white;
      border: none;
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
      }
    }
  `]
})
export class CheckoutCartComponent {
  @Input() items: CartItem[] = [];
  @Output() quantityChange = new EventEmitter<{partId: string, quantity: number}>();
  @Output() itemRemove = new EventEmitter<string>();
  @Output() checkout = new EventEmitter<void>();

  updateQty(item: CartItem, delta: number) {
    const newQty = item.quantity + delta;
    if (newQty >= 1 && newQty <= item.maxAvailable) {
      this.quantityChange.emit({ partId: item.partId, quantity: newQty });
    }
  }

  removeItem(partId: string) {
    this.itemRemove.emit(partId);
  }

  getTotalValue(): number {
    return this.items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }

  onCheckout() {
    this.checkout.emit();
  }
}
