import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { CheckoutItem } from '../../../../core/models/checkout.model';
import { ToastService } from '../../../../core/services/toast.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checkout-layout fade-in">
      <div class="page-header glass-panel">
        <button class="btn-back" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1 class="page-title neon-text-primary">Confirm Checkout</h1>
      </div>

      <div class="content-body">
        <div class="glass-panel main-panel">
          <h3>Items to Checkout</h3>
          
          <div class="items-list" *ngIf="pendingItems.length > 0; else emptyState">
            <div class="item-row" *ngFor="let item of pendingItems">
              <div class="item-details">
                <span class="part-id">Part ID: {{ item.partId }}</span>
                <span class="qty">Qty: {{ item.quantityCheckedOut }}</span>
              </div>
            </div>
          </div>

          <ng-template #emptyState>
            <div class="empty-state">
              <p>No items selected for checkout.</p>
              <button class="btn-secondary" (click)="goBack()">Browse Catalog</button>
            </div>
          </ng-template>

          <div class="actions" *ngIf="pendingItems.length > 0">
            <button class="btn-primary btn-block" (click)="confirmCheckout()" [disabled]="isProcessing">
              <span *ngIf="!isProcessing">Confirm Checkout</span>
              <span *ngIf="isProcessing">Processing...</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-layout {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 8px;
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      font-size: 1rem;
      padding: 8px 12px;
      border-radius: var(--radius-md);

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-text-primary);
      }
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
    }

    .main-panel {
      padding: 24px;
      border-radius: var(--radius-xl);

      h3 {
        margin-top: 0;
        margin-bottom: 20px;
        color: var(--color-text-primary);
        border-bottom: 1px solid var(--glass-border);
        padding-bottom: 12px;
      }
    }

    .items-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 30px;
    }

    .item-row {
      padding: 16px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);

      .item-details {
        display: flex;
        justify-content: space-between;
        
        .part-id {
          font-family: monospace;
          color: var(--color-accent-secondary);
        }
        
        .qty {
          font-weight: 600;
        }
      }
    }

    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--color-text-secondary);

      .btn-secondary {
        margin-top: 16px;
        padding: 10px 20px;
        background: transparent;
        border: 1px solid var(--color-accent-primary);
        color: var(--color-accent-primary);
        border-radius: var(--radius-md);
        cursor: pointer;

        &:hover {
          background: rgba(14, 165, 233, 0.1);
        }
      }
    }

    .btn-primary {
      background: var(--color-accent-primary);
      color: white;
      border: none;
      padding: 14px;
      border-radius: var(--radius-md);
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);

      &.btn-block {
        width: 100%;
      }

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  private router = inject(Router);
  private checkoutService = inject(CheckoutService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  // In a real implementation, this would come from a CartService
  pendingItems: CheckoutItem[] = [];
  isProcessing = false;

  ngOnInit() {
    // Mock data for UI testing since CartService is out of scope for now
    this.pendingItems = [
      {
        partId: 'p-123',
        quantityCheckedOut: 2,
        quantityUsed: 0,
        quantityReturned: 0,
        quantityDamaged: 0,
        status: 'CHECKED_OUT'
      }
    ];
  }

  goBack() {
    this.router.navigate(['/inventory']);
  }

  async confirmCheckout() {
    if (this.pendingItems.length === 0) return;

    this.isProcessing = true;
    try {
      // Get current user ID (mocked if not available)
      const user = await this.authService.getCurrentUser();
      const techId = user?.id || 'mock-tech-id';

      await this.checkoutService.createCheckoutSession(techId, this.pendingItems);
      
      this.toastService.success('Checkout successful!');
      this.pendingItems = []; // Clear cart
      this.router.navigate(['/inventory/my-inventory']);
    } catch (error) {
      console.error(error);
      this.toastService.error('Failed to complete checkout.');
    } finally {
      this.isProcessing = false;
    }
  }
}
