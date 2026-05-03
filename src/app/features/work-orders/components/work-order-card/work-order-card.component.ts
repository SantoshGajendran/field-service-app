import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkOrder } from '../../../../core/models/work-order.model';
import { HapticService } from '../../../../core/services/haptic.service';

@Component({
  selector: 'app-work-order-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card-wrapper"
         [style.transform]="'translateX(' + swipeOffset + 'px)'"
         [class.swiping]="isSwiping"
         (touchstart)="onTouchStart($event)"
         (touchmove)="onTouchMove($event)"
         (touchend)="onTouchEnd()">

      <!-- Swipe Actions Background -->
      <div class="swipe-actions-left" [class.visible]="swipeOffset > 50">
        <div class="swipe-action complete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
          <span>Complete</span>
        </div>
      </div>

      <div class="swipe-actions-right" [class.visible]="swipeOffset < -50">
        <div class="swipe-action delete">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span>Delete</span>
        </div>
      </div>

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
    </div>
  `,
  styles: [`
    .card-wrapper {
      position: relative;
      margin-bottom: 16px;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      touch-action: pan-y;
    }

    .card-wrapper.swiping {
      transition: none;
    }

    .swipe-actions-left,
    .swipe-actions-right {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .swipe-actions-left {
      left: 0;
      background: linear-gradient(to right, rgba(16, 185, 129, 0.2), transparent);
    }

    .swipe-actions-right {
      right: 0;
      background: linear-gradient(to left, rgba(239, 68, 68, 0.2), transparent);
    }

    .swipe-actions-left.visible,
    .swipe-actions-right.visible {
      opacity: 1;
    }

    .swipe-action {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 12px;

      svg {
        width: 32px;
        height: 32px;
      }

      span {
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      &.complete {
        color: var(--color-status-success);

        svg {
          filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.5));
        }
      }

      &.delete {
        color: var(--color-status-error);

        svg {
          filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
        }
      }
    }

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
  @Output() completeAction = new EventEmitter<WorkOrder>();
  @Output() deleteAction = new EventEmitter<WorkOrder>();

  private hapticService = inject(HapticService);

  // Swipe state
  swipeOffset = 0;
  isSwiping = false;
  private startX = 0;
  private startTime = 0;

  get statusClass(): string {
    switch (this.workOrder.status) {
      case 'OPEN': return 'status-open';
      case 'IN_PROGRESS': return 'status-in-progress';
      case 'COMPLETED': return 'status-completed';
      default: return '';
    }
  }

  async onClick(): Promise<void> {
    // Don't trigger click if we're swiping
    if (this.isSwiping || Math.abs(this.swipeOffset) > 5) {
      return;
    }
    await this.hapticService.light();
    this.cardClick.emit(this.workOrder);
  }

  onTouchStart(event: TouchEvent) {
    this.startX = event.touches[0].clientX;
    this.startTime = Date.now();
    this.isSwiping = false;
  }

  onTouchMove(event: TouchEvent) {
    if (!this.startX) return;

    const currentX = event.touches[0].clientX;
    const diff = currentX - this.startX;

    // Only start swiping if moved more than 10px
    if (Math.abs(diff) > 10) {
      this.isSwiping = true;
      this.swipeOffset = diff;

      // Limit swipe distance
      if (this.swipeOffset > 120) this.swipeOffset = 120;
      if (this.swipeOffset < -120) this.swipeOffset = -120;

      // Provide haptic feedback at thresholds
      if (Math.abs(diff) === 60 || Math.abs(diff) === 80) {
        this.hapticService.light();
      }
    }
  }

  async onTouchEnd() {
    const swipeTime = Date.now() - this.startTime;
    const swipeSpeed = Math.abs(this.swipeOffset) / swipeTime;

    // Swipe right (complete action)
    if (this.swipeOffset > 80 || (this.swipeOffset > 50 && swipeSpeed > 0.5)) {
      await this.hapticService.success();
      this.completeAction.emit(this.workOrder);
    }
    // Swipe left (delete action)
    else if (this.swipeOffset < -80 || (this.swipeOffset < -50 && swipeSpeed > 0.5)) {
      await this.hapticService.warning();
      this.deleteAction.emit(this.workOrder);
    }

    // Reset swipe
    this.swipeOffset = 0;
    setTimeout(() => {
      this.isSwiping = false;
    }, 300);
  }
}
