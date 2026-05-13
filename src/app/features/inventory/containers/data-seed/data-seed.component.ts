import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataSeedService } from '../../../../core/services/data-seed.service';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-data-seed',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="seed-page fade-in">
      <div class="glass-panel seed-card">
        <h1 class="neon-text-primary">Database Seed Tool</h1>
        <p class="description">
          This tool will insert the mock inventory data into your Supabase database.
        </p>

        <div class="actions">
          <button 
            class="btn-primary" 
            (click)="seedData()" 
            [disabled]="isLoading">
            <span *ngIf="!isLoading">Seed Inventory Data</span>
            <span *ngIf="isLoading">Seeding...</span>
          </button>

          <button 
            class="btn-danger" 
            (click)="clearCache()" 
            [disabled]="isLoading">
            Clear Local Cache
          </button>
        </div>

        <div class="result" *ngIf="message" [class.success]="success" [class.error]="!success">
          {{ message }}
        </div>

        <div class="info-box">
          <h3>What this does:</h3>
          <ul>
            <li>Inserts 4 stock locations (2 warehouses, 2 technicians)</li>
            <li>Inserts 20 parts (HVAC, Plumbing, Electrical)</li>
            <li>Inserts 33 stock levels across locations</li>
          </ul>
          <p class="note">
            Note: Uses upsert, so it won't create duplicates if data already exists.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .seed-page {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 100px);
      padding: 20px;
    }

    .seed-card {
      max-width: 500px;
      width: 100%;
      padding: 32px;
      text-align: center;

      h1 {
        font-size: 1.5rem;
        margin-bottom: 12px;
      }

      .description {
        color: var(--color-text-secondary);
        margin-bottom: 24px;
      }
    }

    .actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }

    .btn-primary, .btn-danger {
      padding: 14px 24px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all var(--transition-base);
      border: none;
    }

    .btn-primary {
      background: var(--color-accent-primary);
      color: white;
      box-shadow: 0 4px 14px rgba(14, 165, 233, 0.39);

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(14, 165, 233, 0.5);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .btn-danger {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.4);

      &:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.25);
      }
    }

    .result {
      padding: 12px 16px;
      border-radius: var(--radius-md);
      margin-bottom: 20px;
      font-size: 0.9rem;

      &.success {
        background: rgba(16, 185, 129, 0.15);
        color: #4ade80;
        border: 1px solid rgba(16, 185, 129, 0.3);
      }

      &.error {
        background: rgba(239, 68, 68, 0.15);
        color: #f87171;
        border: 1px solid rgba(239, 68, 68, 0.3);
      }
    }

    .info-box {
      text-align: left;
      padding: 16px;
      background: var(--glass-bg-dark);
      border-radius: var(--radius-md);
      border: 1px solid var(--glass-border);

      h3 {
        font-size: 0.9rem;
        margin: 0 0 12px 0;
        color: var(--color-text-primary);
      }

      ul {
        margin: 0;
        padding-left: 20px;
        color: var(--color-text-secondary);
        font-size: 0.85rem;
        line-height: 1.8;
      }

      .note {
        margin: 12px 0 0 0;
        font-size: 0.8rem;
        color: var(--color-text-tertiary);
        font-style: italic;
      }
    }
  `]
})
export class DataSeedComponent {
  private dataSeedService = inject(DataSeedService);
  private storageService = inject(StorageService);

  isLoading = false;
  message = '';
  success = false;

  async seedData() {
    this.isLoading = true;
    this.message = '';

    const result = await this.dataSeedService.seedInventoryData();
    
    this.success = result.success;
    this.message = result.message;
    this.isLoading = false;
  }

  async clearCache() {
    this.isLoading = true;
    this.message = '';

    try {
      await this.storageService.removeItem('inventory_parts');
      await this.storageService.removeItem('inventory_locations');
      await this.storageService.removeItem('inventory_stock_levels');
      
      this.success = true;
      this.message = 'Local cache cleared. Refresh the page to reload data from database.';
    } catch (error: any) {
      this.success = false;
      this.message = error.message || 'Failed to clear cache';
    }
    
    this.isLoading = false;
  }
}