# Complete Inventory Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a comprehensive inventory management system with dual inventory (warehouse + technician), checkout/return workflow, real-time usage tracking, serialized part lifecycle management, RMA processing, and predictive analytics.

**Architecture:** Modular service architecture with 5 core services (InventoryService, CheckoutService, UsageTrackingService, AnalyticsService, RmaService), 4 repositories for data access, and Angular components following the existing app patterns. Full offline support with sync queue and conflict detection.

**Tech Stack:** Angular 21, TypeScript 5.9, Supabase (PostgreSQL + Storage), Capacitor 8, RxJS 7, LocalForage 1.10

---

## File Structure

### Models (Create)
- `src/app/core/models/inventory.model.ts` - Part, StockLocation, StockLevel
- `src/app/core/models/checkout.model.ts` - CheckoutSession, CheckoutItem, PartReturn
- `src/app/core/models/usage.model.ts` - PartUsage, SerializedPart, ServiceHistoryEntry
- `src/app/core/models/rma.model.ts` - RmaRequest, RmaResolution
- `src/app/core/models/analytics.model.ts` - Analytics interfaces

### Repositories (Create)
- `src/app/core/repositories/inventory.repository.ts` - Parts and stock data access
- `src/app/core/repositories/checkout.repository.ts` - Checkout sessions data access
- `src/app/core/repositories/usage.repository.ts` - Part usage records data access
- `src/app/core/repositories/serial-number.repository.ts` - Serialized parts tracking

### Services (Create)
- `src/app/core/services/inventory.service.ts` - Parts catalog, stock management
- `src/app/core/services/checkout.service.ts` - Checkout/return workflows
- `src/app/core/services/usage-tracking.service.ts` - Real-time usage tracking
- `src/app/core/services/analytics.service.ts` - Reports and forecasting
- `src/app/core/services/rma.service.ts` - RMA workflow management

### Components (Create)
- `src/app/features/inventory/inventory.routes.ts` - Routing configuration
- `src/app/features/inventory/containers/inventory-list/inventory-list.component.ts` - Main inventory page
- `src/app/features/inventory/containers/part-detail/part-detail.component.ts` - Part detail page
- `src/app/features/inventory/containers/checkout/checkout.component.ts` - Checkout page
- `src/app/features/inventory/containers/my-inventory/my-inventory.component.ts` - Technician inventory
- `src/app/features/inventory/containers/analytics-dashboard/analytics-dashboard.component.ts` - Analytics page
- `src/app/features/inventory/containers/rma-management/rma-management.component.ts` - RMA page
- `src/app/features/inventory/components/part-card/part-card.component.ts` - Part card component
- `src/app/features/inventory/components/checkout-cart/checkout-cart.component.ts` - Checkout cart
- `src/app/features/inventory/components/part-usage-tracker/part-usage-tracker.component.ts` - Usage tracker
- `src/app/features/inventory/components/stock-level-indicator/stock-level-indicator.component.ts` - Stock indicator
- `src/app/features/inventory/components/part-filter-sidebar/part-filter-sidebar.component.ts` - Filter sidebar
- `src/app/features/inventory/components/rma-form/rma-form.component.ts` - RMA form

### Database (Modify)
- Supabase migrations (SQL scripts to be executed manually)

### Existing Files to Modify
- `src/app/app.routes.ts` - Add inventory routes
- `src/app/features/work-orders/containers/work-order-detail/work-order-detail.component.ts` - Integrate part usage tracker
- `src/app/core/services/supabase.service.ts` - Add inventory-related methods
- `src/app/core/services/sync.service.ts` - Add inventory sync operations

---

## Phase 1: Core Data Models & Repositories (Days 1-2)

### Task 1: Create Inventory Models

**Files:**
- Create: `src/app/core/models/inventory.model.ts`

- [ ] **Step 1: Create inventory models file**

```typescript
export interface Part {
  id: string;
  partNumber: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  equipmentCompatibility: string[];
  photoUrl?: string;
  thumbnailUrl?: string;
  unitCost: number;
  unitPrice: number;
  minStockLevel: number;
  reorderQuantity: number;
  supplier: string;
  supplierPartNumber?: string;
  isSerialTracked: boolean;
  warrantyMonths?: number;
  specifications?: Record<string, any>;
  alternativeParts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StockLocation {
  id: string;
  type: 'WAREHOUSE' | 'TECHNICIAN';
  name: string;
  technicianId?: string;
  address?: string;
  isActive: boolean;
}

export interface StockLevel {
  id: string;
  partId: string;
  locationId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lastUpdated: string;
}

export interface PartFilters {
  category?: string;
  subcategory?: string;
  tags?: string[];
  equipmentId?: string;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface LowStockAlert {
  part: Part;
  currentStock: number;
  minStockLevel: number;
  locationId: string;
  locationName: string;
  severity: 'WARNING' | 'CRITICAL';
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/inventory.model.ts
git commit -m "feat: add inventory data models (Part, StockLocation, StockLevel)"
```

---

### Task 2: Create Checkout Models

**Files:**
- Create: `src/app/core/models/checkout.model.ts`

- [ ] **Step 1: Create checkout models file**

```typescript
export interface CheckoutSession {
  id: string;
  technicianId: string;
  fromLocationId: string;
  toLocationId: string;
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items: CheckoutItem[];
  checkoutDate: string;
  expectedReturnDate?: string;
  actualReturnDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CheckoutItem {
  partId: string;
  quantityCheckedOut: number;
  quantityUsed: number;
  quantityReturned: number;
  quantityDamaged: number;
  serialNumbers?: string[];
  status: 'CHECKED_OUT' | 'PARTIALLY_USED' | 'FULLY_USED' | 'RETURNED' | 'PENDING_RETURN';
}

export interface PartReturn {
  partId: string;
  quantityReturned: number;
  quantityDamaged: number;
  condition: 'GOOD' | 'DAMAGED' | 'DEFECTIVE';
  notes?: string;
  photoUrls?: string[];
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/checkout.model.ts
git commit -m "feat: add checkout data models (CheckoutSession, CheckoutItem, PartReturn)"
```

---

### Task 3: Create Usage Tracking Models

**Files:**
- Create: `src/app/core/models/usage.model.ts`

- [ ] **Step 1: Create usage models file**

```typescript
export interface PartUsage {
  id: string;
  workOrderId: string;
  partId: string;
  technicianId: string;
  checkoutSessionId: string;
  quantity: number;
  serialNumber?: string;
  reason: string;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  customerApproved: boolean;
  customerSignatureUrl?: string;
  installationDate: string;
  warrantyExpirationDate?: string;
  replacementRecommendation?: string;
  notes?: string;
  timestamp: string;
}

export interface SerializedPart {
  id: string;
  partId: string;
  serialNumber: string;
  status: 'IN_STOCK' | 'CHECKED_OUT' | 'INSTALLED' | 'RETURNED' | 'DEFECTIVE' | 'DISPOSED';
  currentLocationId: string;
  installationDate?: string;
  installedOnEquipmentId?: string;
  installedAtWorkOrderId?: string;
  warrantyExpirationDate?: string;
  serviceHistory: ServiceHistoryEntry[];
  purchaseDate?: string;
  purchaseCost?: number;
  supplierBatchNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceHistoryEntry {
  date: string;
  workOrderId: string;
  action: 'INSTALLED' | 'SERVICED' | 'REPLACED' | 'INSPECTED';
  notes: string;
  technicianId: string;
}

export interface SerializedPartInstallation {
  partId: string;
  serialNumber: string;
  workOrderId: string;
  equipmentId: string;
  installationDate: Date;
  warrantyMonths: number;
  notes?: string;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/usage.model.ts
git commit -m "feat: add usage tracking models (PartUsage, SerializedPart)"
```

---

### Task 4: Create RMA Models

**Files:**
- Create: `src/app/core/models/rma.model.ts`

- [ ] **Step 1: Create RMA models file**

```typescript
export interface RmaRequest {
  id: string;
  partId: string;
  serialNumber?: string;
  quantity: number;
  reason: 'DEFECTIVE' | 'DAMAGED' | 'WRONG_PART' | 'EXPIRED' | 'OTHER';
  description: string;
  photoUrls: string[];
  requestedBy: string;
  requestDate: string;
  rmaNumber?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'COMPLETED';
  supplierResponse?: string;
  resolutionType?: 'REPLACEMENT' | 'REFUND' | 'CREDIT';
  resolutionDate?: string;
  trackingNumber?: string;
}

export interface RmaResolution {
  resolutionType: 'REPLACEMENT' | 'REFUND' | 'CREDIT';
  rmaNumber: string;
  supplierResponse: string;
  trackingNumber?: string;
  amount?: number;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/rma.model.ts
git commit -m "feat: add RMA data models (RmaRequest, RmaResolution)"
```

---

### Task 5: Create Analytics Models

**Files:**
- Create: `src/app/core/models/analytics.model.ts`

- [ ] **Step 1: Create analytics models file**

```typescript
export interface InventoryValuation {
  totalValue: number;
  byLocation: { locationId: string; locationName: string; value: number }[];
  byCategory: { category: string; value: number }[];
}

export interface UsageReport {
  totalPartsUsed: number;
  totalCost: number;
  byPart: { partId: string; partName: string; quantity: number; cost: number }[];
  byTechnician: { technicianId: string; technicianName: string; partsUsed: number; cost: number }[];
}

export interface PartUsageStats {
  partId: string;
  partName: string;
  partNumber: string;
  quantityUsed: number;
  frequency: number;
  totalCost: number;
}

export interface ConsumptionTrend {
  month: string;
  quantity: number;
  cost: number;
}

export interface ProfitMargin {
  revenue: number;
  cost: number;
  profit: number;
  marginPercentage: number;
}

export interface SupplierSpend {
  supplier: string;
  totalSpend: number;
  partCount: number;
  averageCost: number;
}

export interface ForecastData {
  partId: string;
  partName: string;
  predictions: { month: string; predictedQuantity: number }[];
  confidence: number;
  recommendedReorderDate: string;
}

export interface ROIAnalysis {
  totalInvestment: number;
  totalRevenue: number;
  roi: number;
  roiPercentage: number;
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/models/analytics.model.ts
git commit -m "feat: add analytics data models"
```

---

### Task 6: Create Inventory Repository

**Files:**
- Create: `src/app/core/repositories/inventory.repository.ts`

- [ ] **Step 1: Create inventory repository**

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { Part, StockLocation, StockLevel } from '../models/inventory.model';

@Injectable({
  providedIn: 'root'
})
export class InventoryRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly PARTS_KEY = 'inventory_parts';
  private readonly LOCATIONS_KEY = 'inventory_locations';
  private readonly STOCK_LEVELS_KEY = 'inventory_stock_levels';

  private partsSubject = new BehaviorSubject<Part[]>([]);
  private locationsSubject = new BehaviorSubject<StockLocation[]>([]);
  private stockLevelsSubject = new BehaviorSubject<StockLevel[]>([]);

  public parts$ = this.partsSubject.asObservable();
  public locations$ = this.locationsSubject.asObservable();
  public stockLevels$ = this.stockLevelsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    // Load from local storage first for instant UI
    const cachedParts = await this.storageService.getItem<Part[]>(this.PARTS_KEY);
    const cachedLocations = await this.storageService.getItem<StockLocation[]>(this.LOCATIONS_KEY);
    const cachedStockLevels = await this.storageService.getItem<StockLevel[]>(this.STOCK_LEVELS_KEY);

    if (cachedParts) this.partsSubject.next(cachedParts);
    if (cachedLocations) this.locationsSubject.next(cachedLocations);
    if (cachedStockLevels) this.stockLevelsSubject.next(cachedStockLevels);

    // Then sync with Supabase
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      // Sync parts
      this.supabase.getParts().subscribe({
        next: (parts) => {
          this.partsSubject.next(parts);
          this.storageService.setItem(this.PARTS_KEY, parts);
        },
        error: (error) => console.error('Error syncing parts:', error)
      });

      // Sync locations
      this.supabase.getStockLocations().subscribe({
        next: (locations) => {
          this.locationsSubject.next(locations);
          this.storageService.setItem(this.LOCATIONS_KEY, locations);
        },
        error: (error) => console.error('Error syncing locations:', error)
      });

      // Sync stock levels
      this.supabase.getStockLevels().subscribe({
        next: (stockLevels) => {
          this.stockLevelsSubject.next(stockLevels);
          this.storageService.setItem(this.STOCK_LEVELS_KEY, stockLevels);
        },
        error: (error) => console.error('Error syncing stock levels:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  // Parts methods
  async createPart(part: Part): Promise<Part> {
    const created = await this.supabase.createPart(part);
    const current = this.partsSubject.getValue();
    const updated = [...current, created];
    this.partsSubject.next(updated);
    await this.storageService.setItem(this.PARTS_KEY, updated);
    return created;
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    const updated = await this.supabase.updatePart(id, updates);
    const current = this.partsSubject.getValue();
    const index = current.findIndex(p => p.id === id);
    if (index > -1) {
      current[index] = updated;
      this.partsSubject.next([...current]);
      await this.storageService.setItem(this.PARTS_KEY, current);
    }
    return updated;
  }

  async deletePart(id: string): Promise<void> {
    await this.supabase.deletePart(id);
    const current = this.partsSubject.getValue();
    const filtered = current.filter(p => p.id !== id);
    this.partsSubject.next(filtered);
    await this.storageService.setItem(this.PARTS_KEY, filtered);
  }

  // Stock level methods
  async updateStockLevel(partId: string, locationId: string, quantity: number): Promise<void> {
    await this.supabase.updateStockLevel(partId, locationId, quantity);
    await this.syncFromSupabase();
  }

  getStockByPart(partId: string): Observable<StockLevel[]> {
    return this.stockLevels$.pipe(
      map(levels => levels.filter(l => l.partId === partId))
    );
  }

  getStockByLocation(locationId: string): Observable<StockLevel[]> {
    return this.stockLevels$.pipe(
      map(levels => levels.filter(l => l.locationId === locationId))
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/repositories/inventory.repository.ts
git commit -m "feat: add inventory repository for parts and stock management"
```

---

Due to context limitations, I'll create a condensed version of the remaining tasks. The full plan would be too large for a single response. Let me continue with the essential structure:

---

## Phase 2: Core Services (Days 2-4)

### Task 7: Create InventoryService
### Task 8: Create CheckoutService  
### Task 9: Create UsageTrackingService
### Task 10: Create AnalyticsService
### Task 11: Create RmaService

## Phase 3: UI Components (Days 4-6)

### Task 12: Create Inventory List Page
### Task 13: Create Part Detail Page
### Task 14: Create Checkout Page
### Task 15: Create My Inventory Page
### Task 16: Create Analytics Dashboard
### Task 17: Create RMA Management Page

## Phase 4: Integration (Days 6-7)

### Task 18: Integrate with Work Order Detail
### Task 19: Add Inventory Routes
### Task 20: Update Supabase Service
### Task 21: Update Sync Service

## Phase 5: Database & Testing (Days 7-10)

### Task 22: Create Supabase Tables
### Task 23: Test Offline Sync
### Task 24: Test Conflict Resolution
### Task 25: End-to-End Testing

---

**Note:** This is a condensed plan structure. Would you like me to:
1. Continue with full detailed steps for all remaining tasks?
2. Focus on specific phases you want to implement first?
3. Proceed with execution using the condensed structure?
