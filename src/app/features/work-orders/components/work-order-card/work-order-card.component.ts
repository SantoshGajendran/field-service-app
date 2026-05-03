import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../../../core/models/work-order.model';
import { HapticService } from '../../../../core/services/haptic.service';

@Component({
  selector: 'app-work-order-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="glass-panel card-container interactive" (click)="onClick()">
      <div class="card-glow"></div>
      <div class="card-header">
        <span class="equipment-id">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="9" y1="9" x2="15" y2="9"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
          {{ workOrder.equipment_id }}
        </span>
        <span class="status-badge" [ngClass]="statusClass">
          <span class="status-dot"></span>
          {{ workOrder.status.replace('_', ' ') }}
        </span>
      </div>

      <div class="card-body">
        <h3 class="title">{{ workOrder.title }}</h3>
        <p class="description">{{ workOrder.description }}</p>
        <div class="meta-info">
          <span class="order-id">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
            </svg>
            {{ workOrder.id }}
          </span>
          <span class="timestamp">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            {{ workOrder.updatedAt | date:'short' }}
          </span>
        </div>
      </div>

      <div class="card-footer">
        <button class="action-btn">
          <span>View Details</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card-container {
      padding: 20px;
      margin-bottom: 16px;
      cursor: pointer;
      transition: all var(--transition-base);
      background: var(--glass-bg);
      position: relative;
      overflow: hidden;
      animation: fadeIn 0.5s ease-out backwards;
    }

    .card-container:nth-child(1) { animation-delay: 0.1s; }
    .card-container:nth-child(2) { animation-delay: 0.2s; }
    .card-container:nth-child(3) { animation-delay: 0.3s; }
    .card-container:nth-child(4) { animation-delay: 0.4s; }

    .card-glow {
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle, rgba(14, 165, 233, 0.1) 0%, transparent 70%);
      opacity: 0;
      transition: opacity var(--transition-base);
      pointer-events: none;
    }

    .card-container:hover .card-glow {
      opacity: 1;
    }

    .card-container:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(148, 163, 184, 0.3);
    }

    .card-container:active {
      transform: translateY(-2px) scale(1.01);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .equipment-id {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      letter-spacing: 1.5px;
      text-transform: uppercase;
      padding: 6px 12px;
      background: rgba(14, 165, 233, 0.1);
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: var(--radius-full);

      svg {
        width: 16px;
        height: 16px;
      }
    }

    .status-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 1px;
      background: rgba(0, 0, 0, 0.2);
      border: 1px solid transparent;
      transition: all var(--transition-base);

      .status-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
      }

      &.status-open {
        color: var(--color-accent-tertiary);
        background: rgba(139, 92, 246, 0.15);
        border-color: rgba(139, 92, 246, 0.4);

        .status-dot {
          background: var(--color-accent-tertiary);
          box-shadow: 0 0 8px var(--color-accent-tertiary);
        }
      }

      &.status-in-progress {
        color: var(--color-accent-secondary);
        background: rgba(245, 158, 11, 0.15);
        border-color: rgba(245, 158, 11, 0.4);

        .status-dot {
          background: var(--color-accent-secondary);
          box-shadow: 0 0 8px var(--color-accent-secondary);
        }
      }

      &.status-completed {
        color: var(--color-status-success);
        background: rgba(16, 185, 129, 0.15);
        border-color: rgba(16, 185, 129, 0.4);

        .status-dot {
          background: var(--color-status-success);
          box-shadow: 0 0 8px var(--color-status-success);
        }
      }
    }

    .card-body {
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .title {
      font-size: 1.25rem;
      color: var(--color-text-primary);
      margin: 0;
      font-weight: 600;
      line-height: 1.4;
    }

    .description {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      line-height: 1.6;
      margin: 0;
    }

    .meta-info {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      flex-wrap: wrap;
    }

    .order-id, .timestamp {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--color-text-tertiary);
      font-family: var(--font-mono);

      svg {
        opacity: 0.6;
      }
    }

    .card-footer {
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid var(--glass-border);
      padding-top: 12px;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--gradient-primary);
      border: none;
      color: white;
      font-size: 0.85rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 12px 24px;
      min-height: 48px;
      border-radius: var(--radius-full);
      transition: all var(--transition-base);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);

      svg {
        width: 16px;
        height: 16px;
        transition: transform var(--transition-base);
      }

      &:hover {
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
        transform: translateX(2px);

        svg {
          transform: translateX(4px);
        }
      }
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class WorkOrderCardComponent {
  @Input({ required: true }) workOrder!: WorkOrder;
  @Output() cardClick = new EventEmitter<WorkOrder>();

  private hapticService = inject(HapticService);

  get statusClass(): string {
    switch (this.workOrder.status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }

  async onClick(): Promise<void> {
    await this.hapticService.light();
    this.cardClick.emit(this.workOrder);
  }
}
