import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { CheckoutItem, CheckoutSession } from '../../../../core/models/checkout.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-my-inventory',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="my-inventory-layout fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title neon-text-primary">My Vehicle Inventory</h1>
          <p class="subtitle">Parts currently checked out to your vehicle</p>
        </div>
      </div>

      <div class="content-body">
        <ng-container *ngIf="activeSessions$ | async as sessions; else loading">
          
          <div *ngIf="sessions.length === 0" class="empty-state glass-panel">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <h3>No Active Inventory</h3>
            <p>You don't have any parts currently checked out.</p>
          </div>

          <div class="session-list" *ngIf="sessions.length > 0">
            <div class="session-card glass-panel" *ngFor="let session of sessions">
              <div class="session-header">
                <div>
                  <h4>Checkout #{{ session.id | slice:0:8 }}</h4>
                  <span class="date">{{ session.checkoutDate | date:'medium' }}</span>
                </div>
                <span class="status-badge" [ngClass]="'status-' + session.status.toLowerCase()">
                  {{ session.status }}
                </span>
              </div>
              
              <div class="items-table">
                <div class="table-header">
                  <div class="col-part">Part</div>
                  <div class="col-qty">Checked Out</div>
                  <div class="col-used">Used</div>
                  <div class="col-avail">Available</div>
                </div>
                
                <div class="table-row" *ngFor="let item of session.items">
                  <div class="col-part">
                    <span class="part-id">{{ item.partId }}</span>
                  </div>
                  <div class="col-qty">{{ item.quantityCheckedOut }}</div>
                  <div class="col-used">{{ item.quantityUsed }}</div>
                  <div class="col-avail highlight">
                    {{ item.quantityCheckedOut - item.quantityUsed - item.quantityReturned }}
                  </div>
                </div>
              </div>

              <div class="session-actions">
                <button class="btn-secondary">Log Return</button>
                <button class="btn-secondary">Report Damaged</button>
              </div>
            </div>
          </div>
        </ng-container>

        <ng-template #loading>
          <div class="loading-state glass-panel">
            <div class="spinner"></div>
            <p>Loading your inventory...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .my-inventory-layout {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 24px;

      .page-title {
        font-size: 1.75rem;
        margin: 0 0 8px 0;
      }

      .subtitle {
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .session-list {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .session-card {
      padding: 24px;
      border-radius: var(--radius-xl);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);

      h4 {
        margin: 0 0 4px 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
      }

      .date {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
      }
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;
      
      &.status-active {
        background: rgba(14, 165, 233, 0.15);
        color: var(--color-accent-primary);
        border: 1px solid rgba(14, 165, 233, 0.3);
      }

      &.status-completed {
        background: rgba(22, 163, 74, 0.15);
        color: var(--color-status-success);
        border: 1px solid rgba(22, 163, 74, 0.3);
      }
    }

    .items-table {
      background: var(--glass-bg-dark);
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--glass-border);
      margin-bottom: 20px;

      .table-header, .table-row {
        display: flex;
        padding: 12px 16px;
      }

      .table-header {
        background: rgba(255, 255, 255, 0.05);
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-text-secondary);
        border-bottom: 1px solid var(--glass-border);
      }

      .table-row {
        border-bottom: 1px solid var(--glass-border);
        font-size: 0.95rem;

        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      }

      .col-part { flex: 2; }
      .col-qty, .col-used, .col-avail { 
        flex: 1; 
        text-align: right;
      }

      .part-id {
        font-family: monospace;
        color: var(--color-text-primary);
      }

      .highlight {
        color: var(--color-accent-primary);
        font-weight: 600;
      }
    }

    .session-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;

      .btn-secondary {
        background: transparent;
        border: 1px solid var(--glass-border);
        color: var(--color-text-primary);
        padding: 8px 16px;
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-base);

        &:hover {
          background: var(--glass-bg-light);
          border-color: var(--color-text-secondary);
        }
      }
    }

    .empty-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
      border-radius: var(--radius-xl);
      min-height: 400px;

      svg {
        width: 64px;
        height: 64px;
        color: var(--color-text-secondary);
        margin-bottom: 16px;
        opacity: 0.5;
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
  `]
})
export class MyInventoryComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private authService = inject(AuthService);

  activeSessions$!: Observable<CheckoutSession[]>;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    const techId = user?.id || 'mock-tech-id';
    
    this.activeSessions$ = this.checkoutService.getActiveCheckouts(techId);
  }
}
