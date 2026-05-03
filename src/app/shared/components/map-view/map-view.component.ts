import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface MapLocation {
  latitude: number;
  longitude: number;
  label?: string;
  type?: 'check-in' | 'check-out' | 'work-site';
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="map-container">
      <div class="map-header" *ngIf="showHeader">
        <h4>{{ title }}</h4>
        <div class="map-actions">
          <button class="map-btn" (click)="openInGoogleMaps()" *ngIf="locations.length > 0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Open in Maps
          </button>
        </div>
      </div>

      <div class="map-wrapper" *ngIf="locations.length > 0">
        <iframe
          *ngIf="mapUrl"
          [src]="mapUrl"
          class="map-iframe"
          frameborder="0"
          allowfullscreen
          loading="lazy"
          referrerpolicy="no-referrer-when-downgrade">
        </iframe>

        <div class="map-legend" *ngIf="showLegend && locations.length > 1">
          <div class="legend-item" *ngFor="let location of locations; let i = index">
            <span class="legend-marker" [class]="location.type || 'default'">{{ i + 1 }}</span>
            <span class="legend-label">{{ location.label || getDefaultLabel(location.type, i) }}</span>
          </div>
        </div>
      </div>

      <div class="no-location" *ngIf="locations.length === 0">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
        <p>No location data available</p>
      </div>
    </div>
  `,
  styles: [`
    .map-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .map-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h4 {
        margin: 0;
        font-size: 1rem;
        color: var(--color-text-primary);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
    }

    .map-actions {
      display: flex;
      gap: 8px;
    }

    .map-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: var(--gradient-primary);
      color: white;
      border: none;
      border-radius: var(--radius-md);
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

      svg {
        width: 16px;
        height: 16px;
      }

      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
      }
    }

    .map-wrapper {
      position: relative;
      width: 100%;
      height: 400px;
      border-radius: var(--radius-md);
      overflow: hidden;
      border: 1px solid var(--glass-border);
    }

    .map-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }

    .map-legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      padding: 12px;
      border-radius: var(--radius-md);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-width: 200px;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.85rem;
    }

    .legend-marker {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      flex-shrink: 0;

      &.check-in {
        background: rgba(14, 165, 233, 0.2);
        border: 2px solid #0ea5e9;
        color: #0ea5e9;
      }

      &.check-out {
        background: rgba(16, 185, 129, 0.2);
        border: 2px solid #10b981;
        color: #10b981;
      }

      &.work-site {
        background: rgba(245, 158, 11, 0.2);
        border: 2px solid #f59e0b;
        color: #f59e0b;
      }

      &.default {
        background: rgba(148, 163, 184, 0.2);
        border: 2px solid #94a3b8;
        color: #94a3b8;
      }
    }

    .legend-label {
      color: #1e293b;
      font-weight: 500;
    }

    .no-location {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 3rem 1rem;
      color: var(--color-text-tertiary);
      background: var(--glass-bg);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

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

    @media (max-width: 768px) {
      .map-wrapper {
        height: 300px;
      }

      .map-legend {
        bottom: 8px;
        left: 8px;
        padding: 8px;
        font-size: 0.8rem;
      }
    }
  `]
})
export class MapViewComponent implements OnInit, OnChanges {
  @Input() locations: MapLocation[] = [];
  @Input() title: string = 'Map View';
  @Input() showHeader: boolean = true;
  @Input() showLegend: boolean = true;
  @Input() height: string = '400px';

  mapUrl: SafeResourceUrl | null = null;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.updateMap();
  }

  ngOnChanges() {
    this.updateMap();
  }

  private updateMap() {
    if (this.locations.length === 0) {
      this.mapUrl = null;
      return;
    }

    let url: string;

    if (this.locations.length === 1) {
      // Single location - simple marker
      const loc = this.locations[0];
      url = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${loc.latitude},${loc.longitude}&zoom=15`;
    } else {
      // Multiple locations - show directions/route
      const origin = this.locations[0];
      const destination = this.locations[this.locations.length - 1];
      const waypoints = this.locations.slice(1, -1)
        .map(loc => `${loc.latitude},${loc.longitude}`)
        .join('|');

      url = `https://www.google.com/maps/embed/v1/directions?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;

      if (waypoints) {
        url += `&waypoints=${waypoints}`;
      }
    }

    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  openInGoogleMaps() {
    if (this.locations.length === 0) return;

    let url: string;

    if (this.locations.length === 1) {
      const loc = this.locations[0];
      url = `https://www.google.com/maps?q=${loc.latitude},${loc.longitude}`;
    } else {
      const origin = this.locations[0];
      const destination = this.locations[this.locations.length - 1];
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;

      if (this.locations.length > 2) {
        const waypoints = this.locations.slice(1, -1)
          .map(loc => `${loc.latitude},${loc.longitude}`)
          .join('|');
        url += `&waypoints=${waypoints}`;
      }
    }

    window.open(url, '_blank');
  }

  getDefaultLabel(type: string | undefined, index: number): string {
    if (type === 'check-in') return 'Check In';
    if (type === 'check-out') return 'Check Out';
    if (type === 'work-site') return 'Work Site';
    return `Location ${index + 1}`;
  }
}
