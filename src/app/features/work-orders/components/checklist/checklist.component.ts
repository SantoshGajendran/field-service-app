import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChecklistItem } from '../../../../core/models/checklist.model';

@Component({
  selector: 'app-checklist',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="checklist-container">
      <h4>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 11l3 3L22 4"></path>
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
        </svg>
        Task Checklist
      </h4>
      <div class="items" *ngIf="items && items.length > 0; else emptyState">
        <label class="checklist-item" *ngFor="let item of items">
          <input
            type="checkbox"
            [checked]="item.isCompleted"
            (change)="onToggle(item)"
            [attr.aria-label]="item.label"
          >
          <span class="checkmark"></span>
          <span class="label-text" [class.completed]="item.isCompleted">{{ item.label }}</span>
        </label>
      </div>

      <div class="progress-bar" *ngIf="items && items.length > 0">
        <div class="progress-label">
          <span>Progress</span>
          <span>{{ completedCount }} / {{ items.length }}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" [style.width.%]="progressPercentage"></div>
        </div>
      </div>

      <ng-template #emptyState>
        <p class="empty-text">No checklist items for this task.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .checklist-container {
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      padding: 1.5rem;
      border: 1px solid var(--glass-border);
      transition: all var(--transition-base);

      h4 {
        margin: 0 0 1.25rem 0;
        color: var(--color-text-primary);
        font-size: 1.1rem;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;

        svg {
          width: 20px;
          height: 20px;
          color: var(--color-accent-primary);
        }
      }
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 0.875rem;
    }

    .checklist-item {
      display: flex;
      align-items: center;
      position: relative;
      cursor: pointer;
      user-select: none;
      padding: 12px 16px 12px 48px;
      min-height: 48px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-lighter);
        border-color: var(--glass-border-light);
        transform: translateX(4px);
      }

      input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        position: absolute;
        top: 50%;
        left: 12px;
        transform: translateY(-50%);
        height: 24px;
        width: 24px;
        background: var(--glass-bg-light);
        border: 2px solid var(--color-accent-primary);
        border-radius: 6px;
        transition: all var(--transition-base);
      }

      &:hover input ~ .checkmark {
        background: var(--glass-bg-lighter);
        box-shadow: 0 0 12px rgba(14, 165, 233, 0.3);
      }

      input:checked ~ .checkmark {
        background: var(--gradient-primary);
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 16px rgba(14, 165, 233, 0.5);
      }

      .checkmark:after {
        content: "";
        position: absolute;
        display: none;
      }

      input:checked ~ .checkmark:after {
        display: block;
        animation: checkPop 0.3s ease-out;
      }

      .checkmark:after {
        left: 7px;
        top: 3px;
        width: 6px;
        height: 12px;
        border: solid white;
        border-width: 0 2.5px 2.5px 0;
        transform: rotate(45deg);
      }

      @keyframes checkPop {
        0% {
          transform: rotate(45deg) scale(0);
        }
        50% {
          transform: rotate(45deg) scale(1.2);
        }
        100% {
          transform: rotate(45deg) scale(1);
        }
      }

      .label-text {
        font-size: 0.95rem;
        color: var(--color-text-primary);
        transition: all var(--transition-base);
        line-height: 1.5;

        &.completed {
          text-decoration: line-through;
          color: var(--color-text-tertiary);
          opacity: 0.6;
        }
      }
    }

    .progress-bar {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--glass-border);
    }

    .progress-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-weight: 600;
    }

    .progress-track {
      height: 8px;
      background: var(--glass-bg);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--glass-border);
    }

    .progress-fill {
      height: 100%;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      transition: width 0.5s ease-out;
      box-shadow: 0 0 12px rgba(14, 165, 233, 0.5);
    }

    .empty-text {
      color: var(--color-text-tertiary);
      font-size: 0.9rem;
      font-style: italic;
      text-align: center;
      padding: 2rem 1rem;
    }
  `]
})
export class ChecklistComponent {
  @Input() items: ChecklistItem[] = [];
  @Output() toggleItem = new EventEmitter<ChecklistItem>();

  get completedCount(): number {
    return this.items.filter(item => item.isCompleted).length;
  }

  get progressPercentage(): number {
    if (this.items.length === 0) return 0;
    return (this.completedCount / this.items.length) * 100;
  }

  onToggle(item: ChecklistItem) {
    this.toggleItem.emit(item);
  }
}
