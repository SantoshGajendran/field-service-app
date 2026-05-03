import { Component } from '@angular/core';

@Component({
  selector: 'app-inventory',
  standalone: true,
  template: `
    <div class="inventory-container fade-in">
      <div class="header">
        <h1 class="page-title neon-text-primary">Inventory</h1>
        <p class="subtitle">Parts and materials management</p>
      </div>

      <div class="coming-soon glass-panel">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
            <polyline points="2 17 12 22 22 17"></polyline>
            <polyline points="2 12 12 17 22 12"></polyline>
          </svg>
        </div>
        <h2>Coming Soon</h2>
        <p>Inventory management features are under development.</p>
        <div class="features-list">
          <div class="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Parts catalog</span>
          </div>
          <div class="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Stock tracking</span>
          </div>
          <div class="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Barcode scanning</span>
          </div>
          <div class="feature-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Low stock alerts</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventory-container {
      padding: 20px;
    }

    .header {
      margin-bottom: 24px;
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

    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 24px;
      text-align: center;
      min-height: 500px;
    }

    .icon-wrapper {
      width: 100px;
      height: 100px;
      margin-bottom: 24px;
      padding: 24px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-full);
      border: 2px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s ease-in-out infinite;

      svg {
        width: 100%;
        height: 100%;
        color: var(--color-accent-primary);
        filter: drop-shadow(0 0 16px rgba(14, 165, 233, 0.6));
      }
    }

    h2 {
      color: var(--color-text-primary);
      margin-bottom: 12px;
      font-size: 2rem;
      font-weight: 700;
    }

    p {
      font-size: 1.1rem;
      color: var(--color-text-secondary);
      max-width: 400px;
      margin-bottom: 32px;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;
      max-width: 600px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      svg {
        color: var(--color-status-success);
        flex-shrink: 0;
      }

      span {
        color: var(--color-text-primary);
        font-weight: 500;
      }

      &:hover {
        border-color: var(--glass-border-light);
        transform: translateY(-2px);
      }
    }
  `]
})
export class InventoryComponent {}
