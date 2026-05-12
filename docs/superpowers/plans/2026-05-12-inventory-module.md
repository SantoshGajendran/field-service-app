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

- [x] **Step 1: Create inventory models file**

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

## Phase 2: Core Services (Days 2-4)

### Task 7: Create Checkout Repository

**Files:**
- Create: `src/app/core/repositories/checkout.repository.ts`

- [ ] **Step 1: Create checkout repository**

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { CheckoutSession } from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly CHECKOUT_KEY = 'checkout_sessions';
  private checkoutSessionsSubject = new BehaviorSubject<CheckoutSession[]>([]);
  public checkoutSessions$ = this.checkoutSessionsSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<CheckoutSession[]>(this.CHECKOUT_KEY);
    if (cached) this.checkoutSessionsSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getCheckoutSessions().subscribe({
        next: (sessions) => {
          this.checkoutSessionsSubject.next(sessions);
          this.storageService.setItem(this.CHECKOUT_KEY, sessions);
        },
        error: (error) => console.error('Error syncing checkout sessions:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createCheckoutSession(session: CheckoutSession): Promise<CheckoutSession> {
    const created = await this.supabase.createCheckoutSession(session);
    const current = this.checkoutSessionsSubject.getValue();
    const updated = [...current, created];
    this.checkoutSessionsSubject.next(updated);
    await this.storageService.setItem(this.CHECKOUT_KEY, updated);
    return created;
  }

  async updateCheckoutSession(id: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const updated = await this.supabase.updateCheckoutSession(id, updates);
    const current = this.checkoutSessionsSubject.getValue();
    const index = current.findIndex(s => s.id === id);
    if (index > -1) {
      current[index] = updated;
      this.checkoutSessionsSubject.next([...current]);
      await this.storageService.setItem(this.CHECKOUT_KEY, current);
    }
    return updated;
  }

  getActiveCheckouts(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutSessions$.pipe(
      map(sessions => sessions.filter(s => 
        s.status === 'ACTIVE' && (!technicianId || s.technicianId === technicianId)
      ))
    );
  }

  getCheckoutHistory(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutSessions$.pipe(
      map(sessions => sessions.filter(s => 
        s.status === 'COMPLETED' && (!technicianId || s.technicianId === technicianId)
      ))
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/repositories/checkout.repository.ts
git commit -m "feat: add checkout repository for session management"
```

---

### Task 8: Create Usage Repository

**Files:**
- Create: `src/app/core/repositories/usage.repository.ts`

- [ ] **Step 1: Create usage repository**

```typescript
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { StorageService } from '../services/storage.service';
import { SupabaseService } from '../services/supabase.service';
import { PartUsage } from '../models/usage.model';

@Injectable({
  providedIn: 'root'
})
export class UsageRepository {
  private storageService = inject(StorageService);
  private supabase = inject(SupabaseService);

  private readonly USAGE_KEY = 'part_usage';
  private partUsageSubject = new BehaviorSubject<PartUsage[]>([]);
  public partUsage$ = this.partUsageSubject.asObservable();

  constructor() {
    this.loadInitialData();
  }

  private async loadInitialData() {
    const cached = await this.storageService.getItem<PartUsage[]>(this.USAGE_KEY);
    if (cached) this.partUsageSubject.next(cached);
    this.syncFromSupabase();
  }

  private async syncFromSupabase() {
    try {
      this.supabase.getPartUsage().subscribe({
        next: (usage) => {
          this.partUsageSubject.next(usage);
          this.storageService.setItem(this.USAGE_KEY, usage);
        },
        error: (error) => console.error('Error syncing part usage:', error)
      });
    } catch (error) {
      console.error('Error in syncFromSupabase:', error);
    }
  }

  async createPartUsage(usage: PartUsage): Promise<PartUsage> {
    const created = await this.supabase.createPartUsage(usage);
    const current = this.partUsageSubject.getValue();
    const updated = [...current, created];
    this.partUsageSubject.next(updated);
    await this.storageService.setItem(this.USAGE_KEY, updated);
    return created;
  }

  getWorkOrderUsage(workOrderId: string): Observable<PartUsage[]> {
    return this.partUsage$.pipe(
      map(usage => usage.filter(u => u.workOrderId === workOrderId))
    );
  }

  getTechnicianUsage(technicianId: string): Observable<PartUsage[]> {
    return this.partUsage$.pipe(
      map(usage => usage.filter(u => u.technicianId === technicianId))
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/repositories/usage.repository.ts
git commit -m "feat: add usage repository for part usage tracking"
```

---

### Task 9: Create InventoryService

**Files:**
- Create: `src/app/core/services/inventory.service.ts`

- [ ] **Step 1: Create inventory service**

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, map, combineLatest } from 'rxjs';
import { InventoryRepository } from '../repositories/inventory.repository';
import { Part, StockLevel, PartFilters, LowStockAlert } from '../models/inventory.model';
import { NetworkService } from './network.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private inventoryRepo = inject(InventoryRepository);
  private networkService = inject(NetworkService);
  private toastService = inject(ToastService);

  // Parts catalog management
  getParts(): Observable<Part[]> {
    return this.inventoryRepo.parts$;
  }

  getPartById(id: string): Observable<Part | undefined> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => parts.find(p => p.id === id))
    );
  }

  searchParts(query: string, filters?: PartFilters): Observable<Part[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        let filtered = parts;

        // Text search
        if (query) {
          const lowerQuery = query.toLowerCase();
          filtered = filtered.filter(p => 
            p.name.toLowerCase().includes(lowerQuery) ||
            p.partNumber.toLowerCase().includes(lowerQuery) ||
            p.description.toLowerCase().includes(lowerQuery) ||
            p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
          );
        }

        // Apply filters
        if (filters) {
          if (filters.category) {
            filtered = filtered.filter(p => p.category === filters.category);
          }
          if (filters.subcategory) {
            filtered = filtered.filter(p => p.subcategory === filters.subcategory);
          }
          if (filters.tags && filters.tags.length > 0) {
            filtered = filtered.filter(p => 
              filters.tags!.some(tag => p.tags.includes(tag))
            );
          }
          if (filters.equipmentId) {
            filtered = filtered.filter(p => 
              p.equipmentCompatibility.includes(filters.equipmentId!)
            );
          }
          if (filters.minPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice >= filters.minPrice!);
          }
          if (filters.maxPrice !== undefined) {
            filtered = filtered.filter(p => p.unitPrice <= filters.maxPrice!);
          }
        }

        return filtered;
      })
    );
  }

  async createPart(part: Part): Promise<Part> {
    try {
      const created = await this.inventoryRepo.createPart(part);
      this.toastService.success('Part created successfully');
      return created;
    } catch (error) {
      this.toastService.error('Failed to create part');
      throw error;
    }
  }

  async updatePart(id: string, updates: Partial<Part>): Promise<Part> {
    try {
      const updated = await this.inventoryRepo.updatePart(id, updates);
      this.toastService.success('Part updated successfully');
      return updated;
    } catch (error) {
      this.toastService.error('Failed to update part');
      throw error;
    }
  }

  async deletePart(id: string): Promise<void> {
    try {
      await this.inventoryRepo.deletePart(id);
      this.toastService.success('Part deleted successfully');
    } catch (error) {
      this.toastService.error('Failed to delete part');
      throw error;
    }
  }

  // Stock management
  getStockLevels(locationId?: string): Observable<StockLevel[]> {
    if (locationId) {
      return this.inventoryRepo.getStockByLocation(locationId);
    }
    return this.inventoryRepo.stockLevels$;
  }

  getStockByPart(partId: string): Observable<StockLevel[]> {
    return this.inventoryRepo.getStockByPart(partId);
  }

  async adjustStock(partId: string, locationId: string, quantity: number, reason: string): Promise<void> {
    try {
      await this.inventoryRepo.updateStockLevel(partId, locationId, quantity);
      this.toastService.success('Stock adjusted successfully');
    } catch (error) {
      this.toastService.error('Failed to adjust stock');
      throw error;
    }
  }

  async transferStock(partId: string, fromLocationId: string, toLocationId: string, quantity: number): Promise<void> {
    try {
      // Get current stock levels
      const fromStock = await this.inventoryRepo.getStockByLocation(fromLocationId).toPromise();
      const toStock = await this.inventoryRepo.getStockByLocation(toLocationId).toPromise();

      const fromLevel = fromStock?.find(s => s.partId === partId);
      const toLevel = toStock?.find(s => s.partId === partId);

      if (!fromLevel || fromLevel.availableQuantity < quantity) {
        throw new Error('Insufficient stock at source location');
      }

      // Decrease from source
      await this.inventoryRepo.updateStockLevel(partId, fromLocationId, fromLevel.quantity - quantity);

      // Increase at destination
      const newToQuantity = (toLevel?.quantity || 0) + quantity;
      await this.inventoryRepo.updateStockLevel(partId, toLocationId, newToQuantity);

      this.toastService.success('Stock transferred successfully');
    } catch (error) {
      this.toastService.error('Failed to transfer stock');
      throw error;
    }
  }

  // Low stock alerts
  getLowStockParts(): Observable<Part[]> {
    return combineLatest([
      this.inventoryRepo.parts$,
      this.inventoryRepo.stockLevels$
    ]).pipe(
      map(([parts, stockLevels]) => {
        return parts.filter(part => {
          const partStock = stockLevels.filter(s => s.partId === part.id);
          const totalStock = partStock.reduce((sum, s) => sum + s.availableQuantity, 0);
          return totalStock < part.minStockLevel;
        });
      })
    );
  }

  async checkLowStockAlerts(): Promise<LowStockAlert[]> {
    const parts = await this.inventoryRepo.parts$.toPromise();
    const stockLevels = await this.inventoryRepo.stockLevels$.toPromise();
    const locations = await this.inventoryRepo.locations$.toPromise();

    const alerts: LowStockAlert[] = [];

    parts?.forEach(part => {
      const partStock = stockLevels?.filter(s => s.partId === part.id) || [];
      
      partStock.forEach(stock => {
        if (stock.availableQuantity < part.minStockLevel) {
          const location = locations?.find(l => l.id === stock.locationId);
          const severity = stock.availableQuantity === 0 ? 'CRITICAL' : 'WARNING';
          
          alerts.push({
            part,
            currentStock: stock.availableQuantity,
            minStockLevel: part.minStockLevel,
            locationId: stock.locationId,
            locationName: location?.name || 'Unknown',
            severity
          });
        }
      });
    });

    return alerts;
  }

  // Categories and tags
  getCategories(): Observable<string[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        const categories = new Set(parts.map(p => p.category));
        return Array.from(categories).sort();
      })
    );
  }

  getTags(): Observable<string[]> {
    return this.inventoryRepo.parts$.pipe(
      map(parts => {
        const tags = new Set(parts.flatMap(p => p.tags));
        return Array.from(tags).sort();
      })
    );
  }

  getEquipmentCompatibility(partId: string): Observable<string[]> {
    return this.getPartById(partId).pipe(
      map(part => part?.equipmentCompatibility || [])
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/inventory.service.ts
git commit -m "feat: add inventory service for parts catalog and stock management"
```

---

### Task 10: Create CheckoutService

**Files:**
- Create: `src/app/core/services/checkout.service.ts`

- [ ] **Step 1: Create checkout service**

```typescript
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { CheckoutRepository } from '../repositories/checkout.repository';
import { InventoryRepository } from '../repositories/inventory.repository';
import { CheckoutSession, CheckoutItem, PartReturn } from '../models/checkout.model';
import { StockLevel } from '../models/inventory.model';
import { ToastService } from './toast.service';
import { SyncService } from './sync.service';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private checkoutRepo = inject(CheckoutRepository);
  private inventoryRepo = inject(InventoryRepository);
  private toastService = inject(ToastService);
  private syncService = inject(SyncService);

  async createCheckoutSession(technicianId: string, items: CheckoutItem[]): Promise<CheckoutSession> {
    try {
      // Validate stock availability
      for (const item of items) {
        const stock = await this.inventoryRepo.getStockByPart(item.partId).toPromise();
        const warehouseStock = stock?.find(s => s.locationId === 'warehouse'); // Assuming warehouse ID
        
        if (!warehouseStock || warehouseStock.availableQuantity < item.quantityCheckedOut) {
          throw new Error(`Insufficient stock for part ${item.partId}`);
        }
      }

      // Create checkout session
      const session: CheckoutSession = {
        id: crypto.randomUUID(),
        technicianId,
        fromLocationId: 'warehouse',
        toLocationId: `tech-${technicianId}`,
        status: 'ACTIVE',
        items: items.map(item => ({
          ...item,
          quantityUsed: 0,
          quantityReturned: 0,
          quantityDamaged: 0,
          status: 'CHECKED_OUT'
        })),
        checkoutDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const created = await this.checkoutRepo.createCheckoutSession(session);

      // Reserve stock
      for (const item of items) {
        // This would update reserved quantity in stock levels
        // Implementation depends on your stock management logic
      }

      // Add to sync queue
      this.syncService.addToSyncQueue({
        id: crypto.randomUUID(),
        entityType: 'CHECKOUT',
        entityId: created.id,
        action: 'CREATE',
        payload: created,
        createdAt: new Date().toISOString(),
        status: 'PENDING',
        retryCount: 0
      });

      this.toastService.success('Parts checked out successfully');
      return created;
    } catch (error) {
      this.toastService.error('Failed to checkout parts');
      throw error;
    }
  }

  getActiveCheckouts(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutRepo.getActiveCheckouts(technicianId);
  }

  getCheckoutHistory(technicianId?: string): Observable<CheckoutSession[]> {
    return this.checkoutRepo.getCheckoutHistory(technicianId);
  }

  async markPartAsUsed(sessionId: string, partId: string, quantity: number): Promise<void> {
    try {
      const sessions = await this.checkoutRepo.checkoutSessions$.toPromise();
      const session = sessions?.find(s => s.id === sessionId);

      if (!session) {
        throw new Error('Checkout session not found');
      }

      const item = session.items.find(i => i.partId === partId);
      if (!item) {
        throw new Error('Part not found in checkout session');
      }

      if (item.quantityCheckedOut - item.quantityUsed < quantity) {
        throw new Error('Insufficient quantity checked out');
      }

      // Update item
      item.quantityUsed += quantity;
      if (item.quantityUsed === item.quantityCheckedOut) {
        item.status = 'FULLY_USED';
      } else if (item.quantityUsed > 0) {
        item.status = 'PARTIALLY_USED';
      }

      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        items: session.items,
        updatedAt: new Date().toISOString()
      });

      this.toastService.success('Part usage recorded');
    } catch (error) {
      this.toastService.error('Failed to record part usage');
      throw error;
    }
  }

  async returnParts(sessionId: string, returns: PartReturn[]): Promise<void> {
    try {
      const sessions = await this.checkoutRepo.checkoutSessions$.toPromise();
      const session = sessions?.find(s => s.id === sessionId);

      if (!session) {
        throw new Error('Checkout session not found');
      }

      // Update items with return information
      for (const returnItem of returns) {
        const item = session.items.find(i => i.partId === returnItem.partId);
        if (item) {
          item.quantityReturned = returnItem.quantityReturned;
          item.quantityDamaged = returnItem.quantityDamaged;
          item.status = 'RETURNED';
        }
      }

      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        items: session.items,
        updatedAt: new Date().toISOString()
      });

      // Transfer stock back to warehouse
      // Implementation depends on your stock management logic

      this.toastService.success('Parts returned successfully');
    } catch (error) {
      this.toastService.error('Failed to return parts');
      throw error;
    }
  }

  async completeCheckoutSession(sessionId: string): Promise<void> {
    try {
      await this.checkoutRepo.updateCheckoutSession(sessionId, {
        status: 'COMPLETED',
        actualReturnDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      this.toastService.success('Checkout session completed');
    } catch (error) {
      this.toastService.error('Failed to complete checkout session');
      throw error;
    }
  }

  getTechnicianInventory(technicianId: string): Observable<StockLevel[]> {
    const techLocationId = `tech-${technicianId}`;
    return this.inventoryRepo.getStockByLocation(techLocationId);
  }

  getPartsNeedingReturn(technicianId: string): Observable<CheckoutItem[]> {
    return this.getActiveCheckouts(technicianId).pipe(
      map(sessions => {
        const items: CheckoutItem[] = [];
        sessions.forEach(session => {
          session.items.forEach(item => {
            const unusedQty = item.quantityCheckedOut - item.quantityUsed - item.quantityReturned;
            if (unusedQty > 0) {
              items.push(item);
            }
          });
        });
        return items;
      })
    );
  }
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npm run build`
Expected: No compilation errors

- [ ] **Step 3: Commit**

```bash
git add src/app/core/services/checkout.service.ts
git commit -m "feat: add checkout service for checkout/return workflows"
```

---

**Note:** Due to the large size of the remaining tasks, I'll continue with the next batch. The plan is being built incrementally to ensure all details are captured properly.

Would you like me to:
1. Continue expanding the remaining tasks (UsageTrackingService, AnalyticsService, RmaService, UI Components, etc.)?
2. Commit what we have so far and continue in the next iteration?
