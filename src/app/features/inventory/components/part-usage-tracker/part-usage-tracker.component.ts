import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { CheckoutService } from '../../../../core/services/checkout.service';
import { UsageTrackingService } from '../../../../core/services/usage-tracking.service';
import { CheckoutItem } from '../../../../core/models/checkout.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-part-usage-tracker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="usage-tracker glass-panel">
      <div class="tracker-header">
        <h3>Log Part Usage</h3>
        <span class="work-order-badge" *ngIf="workOrderId">WO: {{ workOrderId | slice:0:8 }}</span>
      </div>

      <div class="tracker-body">
        <div class="form-group">
          <label>Select Part from Vehicle</label>
          <select [(ngModel)]="selectedPartId" class="form-control">
            <option value="">-- Choose Part --</option>
            <ng-container *ngIf="availableParts$ | async as parts">
              <option *ngFor="let part of parts" [value]="part.partId" [disabled]="getAvailableQty(part) <= 0">
                {{ part.partId }} (Available: {{ getAvailableQty(part) }})
              </option>
            </ng-container>
          </select>
        </div>

        <div class="form-row" *ngIf="selectedPartId">
          <div class="form-group qty-group">
            <label>Quantity</label>
            <input type="number" [(ngModel)]="quantity" min="1" class="form-control" />
          </div>
          
          <button class="btn-primary" (click)="logUsage()" [disabled]="!isValid()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            Log Usage
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .usage-tracker {
      padding: 20px;
      border-radius: var(--radius-lg);
      margin-bottom: 24px;
    }

    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      border-bottom: 1px solid var(--glass-border);
      padding-bottom: 12px;

      h3 {
        margin: 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
      }

      .work-order-badge {
        font-family: monospace;
        font-size: 0.8rem;
        background: rgba(14, 165, 233, 0.15);
        color: var(--color-accent-primary);
        padding: 4px 8px;
        border-radius: 4px;
      }
    }

    .tracker-body {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        font-weight: 500;
      }
    }

    .form-row {
      display: flex;
      align-items: flex-end;
      gap: 16px;
    }

    .qty-group {
      width: 100px;
    }

    .form-control {
      width: 100%;
      padding: 10px 12px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 0.95rem;

      &:focus {
        outline: none;
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.2);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    select.form-control {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 12px center;
      padding-right: 36px;

      option {
        background: var(--color-bg-primary);
        color: var(--color-text-primary);
      }
    }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--color-accent-primary);
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
      height: 42px; /* Match input height */

      svg { width: 18px; height: 18px; }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
      }
    }
  `]
})
export class PartUsageTrackerComponent implements OnInit {
  @Input({ required: true }) workOrderId!: string;
  @Output() usageLogged = new EventEmitter<void>();

  private checkoutService = inject(CheckoutService);
  private usageService = inject(UsageTrackingService);
  private authService = inject(AuthService);

  availableParts$!: Observable<CheckoutItem[]>;
  selectedPartId: string = '';
  quantity: number = 1;

  private techId: string = '';
  private partsCache: CheckoutItem[] = [];

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    this.techId = user?.id || 'mock-tech-id';
    
    this.availableParts$ = this.checkoutService.getPartsNeedingReturn(this.techId);
    
    this.availableParts$.subscribe(parts => {
      this.partsCache = parts;
    });
  }

  getAvailableQty(part: CheckoutItem): number {
    return part.quantityCheckedOut - part.quantityUsed - part.quantityReturned;
  }

  isValid(): boolean {
    if (!this.selectedPartId || this.quantity <= 0) return false;
    
    const part = this.partsCache.find(p => p.partId === this.selectedPartId);
    if (!part) return false;

    return this.quantity <= this.getAvailableQty(part);
  }

  async logUsage() {
    if (!this.isValid()) return;

    try {
      // Create usage log
      await this.usageService.recordPartUsage({
        workOrderId: this.workOrderId,
        technicianId: this.techId,
        partId: this.selectedPartId,
        quantity: this.quantity,
        checkoutSessionId: 'mock-session-id', // TODO: implement real session resolution
        reason: 'Installation',
        customerApproved: true,
        installationDate: new Date().toISOString()
      });

      // Update checkout session usage
      // We need the session ID here, assuming partsCache has it or the service handles finding the right session.
      // For this implementation, the usageService tracks the WO usage.
      
      this.selectedPartId = '';
      this.quantity = 1;
      this.usageLogged.emit();
    } catch (error) {
      console.error('Failed to log usage', error);
    }
  }
}
