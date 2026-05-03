import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkOrderRepository } from '../../core/repositories/work-order.repository';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="admin-container fade-in">
      <div class="header">
        <div class="header-content">
          <h1 class="page-title neon-text-primary">Admin Dashboard</h1>
          <p class="subtitle">System overview and management</p>
        </div>
        <div class="admin-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
            <path d="M2 17l10 5 10-5"></path>
            <path d="M2 12l10 5 10-5"></path>
          </svg>
          <span>Administrator</span>
        </div>
      </div>

      <!-- Statistics Overview -->
      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-header">
            <div class="stat-icon primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <polyline points="17 11 19 13 23 9"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalUsers }}</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change positive">+3 this week</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-header">
            <div class="stat-icon secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ totalWorkOrders }}</span>
              <span class="stat-label">Total Work Orders</span>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change positive">+12 today</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-header">
            <div class="stat-icon success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ completionRate }}%</span>
              <span class="stat-label">Completion Rate</span>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change positive">+5% vs last month</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-header">
            <div class="stat-icon warning">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ pendingWorkOrders }}</span>
              <span class="stat-label">Pending Tasks</span>
            </div>
          </div>
          <div class="stat-footer">
            <span class="stat-change neutral">Requires attention</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="section">
        <h2 class="section-title">Quick Actions</h2>
        <div class="actions-grid">
          <button class="action-card glass-panel interactive">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="8.5" cy="7" r="4"></circle>
                <line x1="20" y1="8" x2="20" y2="14"></line>
                <line x1="23" y1="11" x2="17" y2="11"></line>
              </svg>
            </div>
            <h3>Add User</h3>
            <p>Create new technician account</p>
          </button>

          <button class="action-card glass-panel interactive">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <h3>New Work Order</h3>
            <p>Create and assign task</p>
          </button>

          <button class="action-card glass-panel interactive">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <h3>Reports</h3>
            <p>View analytics and insights</p>
          </button>

          <button class="action-card glass-panel interactive">
            <div class="action-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m5.2-13.2l-4.2 4.2m0 6l4.2 4.2M23 12h-6m-6 0H1m18.2 5.2l-4.2-4.2m0-6l4.2-4.2"></path>
              </svg>
            </div>
            <h3>Settings</h3>
            <p>System configuration</p>
          </button>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="section">
        <h2 class="section-title">Recent Activity</h2>
        <div class="activity-list glass-panel">
          <div class="activity-item" *ngFor="let activity of recentActivities">
            <div class="activity-icon" [class]="activity.type">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="activity-content">
              <p class="activity-text">{{ activity.text }}</p>
              <span class="activity-time">{{ activity.time }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="section">
        <h2 class="section-title">System Status</h2>
        <div class="status-grid">
          <div class="status-card glass-panel">
            <div class="status-header">
              <span class="status-label">API Server</span>
              <span class="status-badge online">Online</span>
            </div>
            <div class="status-bar">
              <div class="status-fill" style="width: 98%"></div>
            </div>
            <span class="status-text">98% uptime</span>
          </div>

          <div class="status-card glass-panel">
            <div class="status-header">
              <span class="status-label">Database</span>
              <span class="status-badge online">Online</span>
            </div>
            <div class="status-bar">
              <div class="status-fill" style="width: 95%"></div>
            </div>
            <span class="status-text">95% uptime</span>
          </div>

          <div class="status-card glass-panel">
            <div class="status-header">
              <span class="status-label">Sync Service</span>
              <span class="status-badge online">Online</span>
            </div>
            <div class="status-bar">
              <div class="status-fill" style="width: 100%"></div>
            </div>
            <span class="status-text">100% uptime</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      flex-wrap: wrap;
    }

    .header-content {
      flex: 1;
    }

    .page-title {
      font-size: 1.75rem;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .admin-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      color: white;
      font-weight: 600;
      font-size: 0.9rem;
      box-shadow: var(--neon-primary);

      svg {
        width: 20px;
        height: 20px;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }

    .stat-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-4px);
      }
    }

    .stat-header {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 28px;
        height: 28px;
        color: white;
      }

      &.primary {
        background: var(--gradient-primary);
        box-shadow: var(--neon-primary);
      }

      &.secondary {
        background: var(--gradient-secondary);
        box-shadow: var(--neon-secondary);
      }

      &.success {
        background: var(--gradient-success);
        box-shadow: var(--neon-success);
      }

      &.warning {
        background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
        box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
      }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .stat-footer {
      padding-top: 8px;
      border-top: 1px solid var(--glass-border);
    }

    .stat-change {
      font-size: 0.8rem;
      font-weight: 600;

      &.positive {
        color: var(--color-status-success);
      }

      &.negative {
        color: var(--color-status-error);
      }

      &.neutral {
        color: var(--color-text-secondary);
      }
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .action-card {
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 12px;
      background: var(--glass-bg);
      border: 2px solid var(--glass-border);
      cursor: pointer;
      transition: all var(--transition-base);

      &:hover {
        border-color: var(--color-accent-primary);
        transform: translateY(-4px);
        box-shadow: var(--glass-shadow-hover);
      }

      h3 {
        font-size: 1rem;
        font-weight: 700;
        color: var(--color-text-primary);
        margin: 0;
      }

      p {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .action-icon {
      width: 56px;
      height: 56px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 28px;
        height: 28px;
        color: var(--color-accent-primary);
      }
    }

    .activity-list {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      max-height: 400px;
      overflow-y: auto;
    }

    .activity-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 12px;
      background: var(--glass-bg-lighter);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-light);
      }
    }

    .activity-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
        color: white;
      }

      &.success {
        background: var(--color-status-success);
      }

      &.warning {
        background: var(--color-status-warning);
      }

      &.info {
        background: var(--color-status-info);
      }
    }

    .activity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .activity-text {
      font-size: 0.9rem;
      color: var(--color-text-primary);
      margin: 0;
    }

    .activity-time {
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
    }

    .status-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .status-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .status-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
    }

    .status-badge {
      padding: 4px 12px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;

      &.online {
        background: rgba(16, 185, 129, 0.2);
        color: var(--color-status-success);
      }

      &.offline {
        background: rgba(239, 68, 68, 0.2);
        color: var(--color-status-error);
      }
    }

    .status-bar {
      height: 8px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-full);
      overflow: hidden;
    }

    .status-fill {
      height: 100%;
      background: var(--gradient-success);
      border-radius: var(--radius-full);
      transition: width var(--transition-base);
    }

    .status-text {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
  `]
})
export class AdminComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);
  private workOrderRepo = inject(WorkOrderRepository);
  private supabase = inject(SupabaseService);

  totalUsers = 15;
  totalWorkOrders = 0;
  completionRate = 0;
  pendingWorkOrders = 0;

  recentActivities = [
    { type: 'success', text: 'Work order WO-001 completed by John Technician', time: '5 minutes ago' },
    { type: 'info', text: 'New user "Mike Smith" registered', time: '15 minutes ago' },
    { type: 'warning', text: 'Work order WO-045 overdue', time: '1 hour ago' },
    { type: 'success', text: 'System backup completed successfully', time: '2 hours ago' },
    { type: 'info', text: 'Database optimization completed', time: '3 hours ago' }
  ];

  async ngOnInit() {
    // Check if user is admin
    const user = this.authService.getCurrentUser();
    if (!user || user.role !== 'Administrator') {
      this.router.navigate(['/work-orders']);
      return;
    }

    // Load real statistics from Supabase
    try {
      const stats = await this.supabase.getStatistics();
      this.totalWorkOrders = stats.total;
      this.pendingWorkOrders = stats.open;
      this.completionRate = stats.completionRate;
    } catch (error) {
      console.error('Error loading statistics from Supabase:', error);
      // Fallback to local data
      this.workOrderRepo.workOrders$.subscribe(workOrders => {
        this.totalWorkOrders = workOrders.length;
        this.pendingWorkOrders = workOrders.filter(wo => wo.status === 'OPEN').length;
        const completed = workOrders.filter(wo => wo.status === 'COMPLETED').length;
        this.completionRate = workOrders.length > 0 ? Math.round((completed / workOrders.length) * 100) : 0;
      });
    }
  }
}
