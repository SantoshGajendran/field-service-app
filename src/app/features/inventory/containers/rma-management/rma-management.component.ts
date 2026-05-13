import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { RmaService } from '../../../../core/services/rma.service';
import { RmaRequest } from '../../../../core/models/rma.model';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-rma-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="rma-layout fade-in">
      <div class="page-header">
        <div>
          <h1 class="page-title neon-text-primary">RMA Management</h1>
          <p class="subtitle">Return Merchandise Authorization for damaged or defective parts</p>
        </div>
        <button class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New RMA Request
        </button>
      </div>

      <div class="content-body">
        <div class="rma-list glass-panel" *ngIf="rmaRequests$ | async as requests; else loading">
          
          <div class="empty-state" *ngIf="requests.length === 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="14" x2="23" y2="14"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="14" x2="4" y2="14"></line>
            </svg>
            <h3>No RMA Requests</h3>
            <p>You don't have any active return requests.</p>
          </div>

          <table class="data-table" *ngIf="requests.length > 0">
            <thead>
              <tr>
                <th>RMA ID</th>
                <th>Date</th>
                <th>Part ID</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let rma of requests">
                <td class="font-mono">{{ rma.id | slice:0:8 }}</td>
                <td>{{ rma.requestDate | date:'shortDate' }}</td>
                <td class="font-mono">{{ rma.partId }}</td>
                <td>{{ rma.reason }}</td>
                <td>
                  <span class="status-badge" [ngClass]="'status-' + rma.status.toLowerCase()">
                    {{ rma.status }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <ng-template #loading>
          <div class="loading-state glass-panel">
            <div class="spinner"></div>
            <p>Loading RMA requests...</p>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .rma-layout {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
      transition: all var(--transition-base);

      svg { width: 18px; height: 18px; }

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
      }
    }

    .rma-list {
      padding: 24px;
      border-radius: var(--radius-xl);
      min-height: 400px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;

      th, td {
        padding: 16px;
        border-bottom: 1px solid var(--glass-border);
      }

      th {
        color: var(--color-text-secondary);
        font-weight: 600;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      td {
        color: var(--color-text-primary);
        font-size: 0.95rem;

        &.font-mono {
          font-family: monospace;
          color: var(--color-accent-secondary);
        }
      }

      tbody tr {
        transition: background-color var(--transition-base);

        &:hover {
          background: rgba(255, 255, 255, 0.02);
        }
      }
    }

    .status-badge {
      padding: 4px 10px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.5px;

      &.status-pending {
        background: rgba(245, 158, 11, 0.15);
        color: var(--color-status-warning);
        border: 1px solid rgba(245, 158, 11, 0.3);
      }

      &.status-approved {
        background: rgba(16, 185, 129, 0.15);
        color: var(--color-status-success);
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.status-rejected {
        background: rgba(239, 68, 68, 0.15);
        color: var(--color-status-danger);
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .btn-icon {
      background: transparent;
      border: none;
      color: var(--color-text-secondary);
      cursor: pointer;
      padding: 8px;
      border-radius: 50%;
      transition: all var(--transition-base);

      svg { width: 18px; height: 18px; }

      &:hover {
        background: var(--glass-bg-light);
        color: var(--color-accent-primary);
      }
    }

    .empty-state, .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      min-height: 300px;
      color: var(--color-text-secondary);
      text-align: center;

      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        color: var(--color-text-primary);
        margin: 0 0 8px 0;
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
export class RmaManagementComponent implements OnInit {
  private rmaService = inject(RmaService);
  private authService = inject(AuthService);

  rmaRequests$!: Observable<RmaRequest[]>;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();
    const techId = user?.id || 'mock-tech-id';
    
    this.rmaRequests$ = this.rmaService.getTechnicianRmas(techId);
  }
}
