import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocationHistoryService } from '../../../core/services/location-history.service';
import { LocationService } from '../../../core/services/location.service';
import { LocationHistory, LocationHistoryEntry } from '../../../core/models/location-history.model';

@Component({
  selector: 'app-location-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="location-history" *ngIf="history">
      <div class="history-header">
        <h4>Location History</h4>
        <div class="history-stats">
          <div class="stat-item">
            <span class="stat-label">Total Time</span>
            <span class="stat-value">{{ formatDuration(history.totalDuration) }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Total Distance</span>
            <span class="stat-value">{{ formatDistance(history.totalDistance) }}</span>
          </div>
        </div>
      </div>

      <div class="history-timeline" *ngIf="history.entries.length > 0">
        <div class="timeline-item" *ngFor="let entry of history.entries; let i = index">
          <div class="timeline-marker" [class.check-in]="entry.type === 'CHECK_IN'" [class.check-out]="entry.type === 'CHECK_OUT'">
            <svg *ngIf="entry.type === 'CHECK_IN'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <svg *ngIf="entry.type === 'CHECK_OUT'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 11 12 14 22 4"></polyline>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>

          <div class="timeline-content">
            <div class="entry-header">
              <span class="entry-type">{{ entry.type === 'CHECK_IN' ? 'Check In' : 'Check Out' }}</span>
              <span class="entry-time">{{ entry.timestamp | date:'short' }}</span>
            </div>

            <div class="entry-location">
              <span class="coords">{{ entry.location.latitude.toFixed(6) }}, {{ entry.location.longitude.toFixed(6) }}</span>
              <span class="accuracy">±{{ entry.location.accuracy.toFixed(0) }}m</span>
            </div>

            <div class="entry-details" *ngIf="entry.type === 'CHECK_OUT'">
              <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>{{ formatDuration(entry.duration || 0) }}</span>
              </div>
              <div class="detail-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
                <span>{{ formatDistance(entry.distance || 0) }}</span>
              </div>
            </div>

            <a [href]="getMapUrl(entry.location.latitude, entry.location.longitude)"
               target="_blank"
               class="map-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
                <line x1="8" y1="2" x2="8" y2="18"></line>
                <line x1="16" y1="6" x2="16" y2="22"></line>
              </svg>
              View on Map
            </a>

            <p class="entry-notes" *ngIf="entry.notes">{{ entry.notes }}</p>
          </div>
        </div>
      </div>

      <div class="no-history" *ngIf="history.entries.length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>No location history yet</p>
      </div>
    </div>
  `,
  styles: [`
    .location-history {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .history-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;

      h4 {
        margin: 0;
        font-size: 1rem;
        color: var(--color-text-primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .history-stats {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 12px;
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      .stat-label {
        font-size: 0.75rem;
        color: var(--color-text-tertiary);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stat-value {
        font-size: 1.1rem;
        color: var(--color-accent-primary);
        font-weight: 600;
      }
    }

    .history-timeline {
      display: flex;
      flex-direction: column;
      gap: 0;
      position: relative;
      padding-left: 24px;

      &::before {
        content: '';
        position: absolute;
        left: 11px;
        top: 0;
        bottom: 0;
        width: 2px;
        background: var(--glass-border);
      }
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
      padding-bottom: 24px;

      &:last-child {
        padding-bottom: 0;
      }
    }

    .timeline-marker {
      position: absolute;
      left: -24px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1;

      svg {
        width: 14px;
        height: 14px;
      }

      &.check-in {
        background: rgba(14, 165, 233, 0.2);
        border: 2px solid var(--color-accent-primary);
        color: var(--color-accent-primary);
      }

      &.check-out {
        background: rgba(16, 185, 129, 0.2);
        border: 2px solid #10b981;
        color: #10b981;
      }
    }

    .timeline-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .entry-type {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }

      .entry-time {
        font-size: 0.75rem;
        color: var(--color-text-tertiary);
      }
    }

    .entry-location {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-mono);
      font-size: 0.8rem;

      .coords {
        color: var(--color-text-secondary);
      }

      .accuracy {
        padding: 2px 6px;
        background: rgba(14, 165, 233, 0.15);
        border-radius: var(--radius-sm);
        font-size: 0.7rem;
        color: var(--color-accent-primary);
      }
    }

    .entry-details {
      display: flex;
      gap: 16px;
      padding-top: 8px;
      border-top: 1px solid var(--glass-border);
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--color-text-secondary);

      svg {
        width: 16px;
        height: 16px;
        color: var(--color-accent-primary);
      }
    }

    .map-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: transparent;
      border: 1px solid var(--color-accent-primary);
      border-radius: var(--radius-md);
      color: var(--color-accent-primary);
      font-size: 0.8rem;
      font-weight: 600;
      text-decoration: none;
      transition: all var(--transition-base);
      align-self: flex-start;

      svg {
        width: 14px;
        height: 14px;
      }

      &:hover {
        background: rgba(14, 165, 233, 0.1);
        transform: translateX(2px);
      }
    }

    .entry-notes {
      margin: 0;
      padding: 8px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .no-history {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 3rem 1rem;
      color: var(--color-text-tertiary);

      svg {
        width: 48px;
        height: 48px;
        opacity: 0.5;
      }

      p {
        margin: 0;
        font-size: 0.9rem;
      }
    }
  `]
})
export class LocationHistoryComponent {
  @Input() workOrderId!: string;

  private locationHistoryService = inject(LocationHistoryService);
  private locationService = inject(LocationService);

  history: LocationHistory | null = null;

  ngOnInit() {
    if (this.workOrderId) {
      this.loadHistory();
    }
  }

  ngOnChanges() {
    if (this.workOrderId) {
      this.loadHistory();
    }
  }

  private loadHistory() {
    this.history = this.locationHistoryService.getHistoryForWorkOrder(this.workOrderId);
  }

  formatDuration(minutes: number): string {
    return this.locationService.formatDuration(minutes);
  }

  formatDistance(meters: number): string {
    return this.locationService.formatDistance(meters);
  }

  getMapUrl(latitude: number, longitude: number): string {
    return this.locationService.getMapUrl(latitude, longitude);
  }
}
