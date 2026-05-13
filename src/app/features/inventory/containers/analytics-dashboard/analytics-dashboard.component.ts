import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { AnalyticsService } from '../../../../core/services/analytics.service';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="analytics-layout fade-in">
      <div class="page-header">
        <h1 class="page-title neon-text-primary">Inventory Analytics</h1>
        <p class="subtitle">Insights and optimization recommendations</p>
      </div>

      <div class="dashboard-grid" *ngIf="metrics$ | async as metrics; else loading">
        
        <!-- Top Metrics Cards -->
        <div class="metrics-row">
          <div class="metric-card glass-panel">
            <div class="metric-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <div class="metric-data">
              <span class="label">Total Value</span>
              <span class="value">\${{ metrics.totalValue | number:'1.0-0' }}</span>
            </div>
          </div>
          
          <div class="metric-card glass-panel">
            <div class="metric-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="metric-data">
              <span class="label">Low Stock Items</span>
              <span class="value">{{ metrics.lowStockItems }}</span>
            </div>
          </div>

          <div class="metric-card glass-panel">
            <div class="metric-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
            </div>
            <div class="metric-data">
              <span class="label">Turnover Rate</span>
              <span class="value">{{ metrics.turnoverRate | number:'1.1-1' }}x</span>
            </div>
          </div>
        </div>

        <!-- Main Charts Area -->
        <div class="charts-row">
          <div class="chart-panel glass-panel">
            <h3>Usage Trends (Last 30 Days)</h3>
            <div class="mock-chart">
              <!-- In a real app, use Chart.js or D3 here -->
              <div class="bar-container" *ngFor="let trend of (trends$ | async)">
                <div class="bar" [style.height.%]="(trend.quantityUsed / 100) * 100"></div>
                <span class="bar-label">{{ trend.partId | slice:0:4 }}</span>
              </div>
            </div>
          </div>

          <div class="recommendations-panel glass-panel">
            <h3>Optimization Recommendations</h3>
            <div class="rec-list" *ngIf="recommendations$ | async as recs">
              <div class="rec-item" *ngFor="let rec of recs" [ngClass]="rec.type.toLowerCase()">
                <div class="rec-icon">
                  <svg *ngIf="rec.type === 'REORDER'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  <svg *ngIf="rec.type === 'OVERSTOCK'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                  </svg>
                  <svg *ngIf="rec.type === 'TRANSFER'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="16 12 12 8 8 12"></polyline>
                    <line x1="12" y1="16" x2="12" y2="8"></line>
                  </svg>
                </div>
                <div class="rec-content">
                  <span class="rec-title">{{ rec.type | titlecase }} Needed</span>
                  <p>{{ rec.reason }}</p>
                  <span class="rec-action">Part: {{ rec.partId }} | Qty: {{ rec.suggestedQuantity }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ng-template #loading>
        <div class="loading-state glass-panel">
          <div class="spinner"></div>
          <p>Analyzing inventory data...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .analytics-layout {
      padding: 20px;
      max-width: 1200px;
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

    .dashboard-grid {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 24px;
    }

    .metric-card {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 24px;
      border-radius: var(--radius-xl);

      .metric-icon {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;

        svg { width: 28px; height: 28px; }

        &.warning {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-status-warning);
        }

        &.success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-status-success);
        }
      }

      .metric-data {
        display: flex;
        flex-direction: column;

        .label {
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          margin-bottom: 4px;
        }

        .value {
          font-size: 1.8rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }
      }
    }

    .charts-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 24px;

      @media (max-width: 900px) {
        grid-template-columns: 1fr;
      }
    }

    .chart-panel, .recommendations-panel {
      padding: 24px;
      border-radius: var(--radius-xl);
      min-height: 400px;

      h3 {
        margin-top: 0;
        margin-bottom: 24px;
        color: var(--color-text-primary);
      }
    }

    .mock-chart {
      height: 300px;
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding-bottom: 30px;
      border-bottom: 1px solid var(--glass-border);
      position: relative;

      .bar-container {
        flex: 1;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        position: relative;

        .bar {
          width: 100%;
          background: var(--color-accent-primary);
          border-radius: 4px 4px 0 0;
          min-height: 10px;
          transition: height 1s ease-out;
          opacity: 0.8;

          &:hover {
            opacity: 1;
            box-shadow: var(--neon-glow);
          }
        }

        .bar-label {
          position: absolute;
          bottom: -24px;
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }
      }
    }

    .rec-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .rec-item {
      display: flex;
      gap: 16px;
      padding: 16px;
      background: var(--glass-bg-dark);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);

      .rec-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        
        svg { width: 20px; height: 20px; }
      }

      &.reorder .rec-icon {
        background: rgba(245, 158, 11, 0.1);
        color: var(--color-status-warning);
      }

      &.overstock .rec-icon {
        background: rgba(14, 165, 233, 0.1);
        color: var(--color-accent-primary);
      }

      &.transfer .rec-icon {
        background: rgba(16, 185, 129, 0.1);
        color: var(--color-status-success);
      }

      .rec-content {
        .rec-title {
          font-weight: 600;
          color: var(--color-text-primary);
          display: block;
          margin-bottom: 4px;
        }

        p {
          font-size: 0.85rem;
          color: var(--color-text-secondary);
          margin: 0 0 8px 0;
          line-height: 1.4;
        }

        .rec-action {
          font-size: 0.8rem;
          font-family: monospace;
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 6px;
          border-radius: 4px;
          color: var(--color-text-primary);
        }
      }
    }

    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 400px;
      border-radius: var(--radius-xl);

      .spinner {
        width: 48px;
        height: 48px;
        border: 4px solid rgba(14, 165, 233, 0.2);
        border-left-color: var(--color-accent-primary);
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
      }
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }
  `]
})
export class AnalyticsDashboardComponent implements OnInit {
  private analyticsService = inject(AnalyticsService);

  metrics$!: Observable<any>;
  trends$!: Observable<any[]>;
  recommendations$!: Observable<any[]>;

  ngOnInit() {
    this.metrics$ = this.analyticsService.getInventoryValuation() as any;
    this.trends$ = of([]);
    this.recommendations$ = of([]);
  }
}
