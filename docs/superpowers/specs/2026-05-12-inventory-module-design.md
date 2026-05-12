# Complete Inventory Module - Design Specification

**Date:** May 12, 2026  
**Project:** Saazvat Field Service Application  
**Feature:** Complete Inventory Management Module  
**Architecture:** Modular Service Architecture  
**Estimated Effort:** 7-10 days

---

## 1. Executive Summary

This specification defines a comprehensive inventory management system for the field service application. The module enables tracking of parts across central warehouse and individual technician inventories, with a checkout/return workflow, real-time usage tracking, serialized part lifecycle management, RMA processing, and predictive analytics.

### Key Features

- **Dual Inventory System:** Central warehouse + individual technician inventories
- **Checkout/Return Workflow:** Library-style checkout with return tracking for unused items
- **Real-Time Usage Tracking:** Mark parts as used during work orders with comprehensive documentation
- **Serialized Part Tracking:** Full lifecycle tracking with warranty and service history
- **Visual Part Catalog:** Photo-based browsing with filters and equipment compatibility
- **RMA Management:** Return merchandise authorization for defective/damaged parts
- **Predictive Analytics:** Forecasting, usage trends, ROI analysis, and slow-moving inventory alerts
- **Offline Support:** Full offline operations with sync queue and conflict detection

---

## 2. Architecture Overview

### 2.1 Modular Service Architecture

The inventory module follows a modular service architecture pattern, consistent with the existing codebase structure (PhotoService, LocationService, etc.).

**Core Services:**
- `InventoryService` - Parts catalog, stock levels, inventory operations
- `CheckoutService` - Checkout/return workflows
- `UsageTrackingService` - Real-time part usage tracking
- `AnalyticsService` - Reports, forecasts, insights
- `RmaService` - Return merchandise authorization

**Data Layer:**
- `InventoryRepository` - Parts and stock data access
- `CheckoutRepository` - Checkout sessions data access
- `UsageRepository` - Part usage records data access
- `SerialNumberRepository` - Serialized parts tracking

**Shared Services:**
- `SyncService` - Offline sync queue (existing)
- `PhotoService` - Photo uploads (existing)
- `NetworkService` - Network status (existing)
- `ToastService` - User notifications (existing)

---

## 3. Data Models

### 3.1 Part Entity

```typescript
interface Part {
  id: string;
  partNumber: string;                    // Unique identifier (e.g., "P-12345")
  name: string;                          // Display name
  description: string;                   // Detailed description
  category: string;                      // Main category (e.g., "Electrical")
  subcategory?: string;                  // Sub-category (e.g., "Switches")
  tags: string[];                        // Searchable tags
  equipmentCompatibility: string[];      // Equipment IDs this part works with
  photoUrl?: string;                     // Full-size photo
  thumbnailUrl?: string;                 // Thumbnail for grid view
  unitCost: number;                      // Cost per unit
  unitPrice: number;                     // Billing price per unit
  minStockLevel: number;                 // Minimum stock threshold
  reorderQuantity: number;               // Suggested reorder quantity
  supplier: string;                      // Supplier name
  supplierPartNumber?: string;           // Supplier's part number
  isSerialTracked: boolean;              // Track individual serial numbers?
  warrantyMonths?: number;               // Warranty period in months
  specifications?: Record<string, any>;  // Custom specifications
  alternativeParts?: string[];           // Alternative part IDs
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.2 Stock Location

```typescript
interface StockLocation {
  id: string;
  type: 'WAREHOUSE' | 'TECHNICIAN';
  name: string;                          // Location name
  technicianId?: string;                 // If type is TECHNICIAN
  address?: string;                      // Physical address
  isActive: boolean;
}
```

### 3.3 Stock Level

```typescript
interface StockLevel {
  partId: string;
  locationId: string;
  quantity: number;                      // Total quantity
  reservedQuantity: number;              // Checked out but not used
  availableQuantity: number;             // quantity - reservedQuantity
  lastUpdated: Date;
}
```

### 3.4 Checkout Session

```typescript
interface CheckoutSession {
  id: string;
  technicianId: string;
  fromLocationId: string;                // Usually warehouse
  toLocationId: string;                  // Technician's inventory
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  items: CheckoutItem[];
  checkoutDate: Date;
  expectedReturnDate?: Date;
  actualReturnDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CheckoutItem {
  partId: string;
  quantityCheckedOut: number;
  quantityUsed: number;
  quantityReturned: number;
  quantityDamaged: number;
  serialNumbers?: string[];              // For serialized parts
  status: 'CHECKED_OUT' | 'PARTIALLY_USED' | 'FULLY_USED' | 'RETURNED' | 'PENDING_RETURN';
}
```

### 3.5 Part Usage

```typescript
interface PartUsage {
  id: string;
  workOrderId: string;
  partId: string;
  technicianId: string;
  checkoutSessionId: string;
  quantity: number;
  serialNumber?: string;                 // For serialized parts
  reason: string;                        // Why part was used
  beforePhotoUrl?: string;               // Before installation
  afterPhotoUrl?: string;                // After installation
  customerApproved: boolean;
  customerSignatureUrl?: string;
  installationDate: Date;
  warrantyExpirationDate?: Date;
  replacementRecommendation?: string;    // Suggest replacement part
  notes?: string;
  timestamp: Date;
}
```

### 3.6 Serialized Part

```typescript
interface SerializedPart {
  id: string;
  partId: string;
  serialNumber: string;
  status: 'IN_STOCK' | 'CHECKED_OUT' | 'INSTALLED' | 'RETURNED' | 'DEFECTIVE' | 'DISPOSED';
  currentLocationId: string;
  installationDate?: Date;
  installedOnEquipmentId?: string;
  installedAtWorkOrderId?: string;
  warrantyExpirationDate?: Date;
  serviceHistory: ServiceHistoryEntry[];
  purchaseDate?: Date;
  purchaseCost?: number;
  supplierBatchNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ServiceHistoryEntry {
  date: Date;
  workOrderId: string;
  action: 'INSTALLED' | 'SERVICED' | 'REPLACED' | 'INSPECTED';
  notes: string;
  technicianId: string;
}
```

### 3.7 RMA Request

```typescript
interface RmaRequest {
  id: string;
  partId: string;
  serialNumber?: string;
  quantity: number;
  reason: 'DEFECTIVE' | 'DAMAGED' | 'WRONG_PART' | 'EXPIRED' | 'OTHER';
  description: string;
  photoUrls: string[];
  requestedBy: string;
  requestDate: Date;
  rmaNumber?: string;                    // Generated RMA number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SHIPPED' | 'COMPLETED';
  supplierResponse?: string;
  resolutionType?: 'REPLACEMENT' | 'REFUND' | 'CREDIT';
  resolutionDate?: Date;
  trackingNumber?: string;
}
```

---

## 4. Service Interfaces

### 4.1 InventoryService

**Purpose:** Manages parts catalog, stock levels, and inventory operations.

**Key Methods:**
- `getParts(): Observable<Part[]>` - Get all parts
- `getPartById(id: string): Observable<Part>` - Get single part
- `searchParts(query: string, filters?: PartFilters): Observable<Part[]>` - Search with filters
- `createPart(part: Part): Promise<Part>` - Create new part
- `updatePart(id: string, updates: Partial<Part>): Promise<Part>` - Update part
- `getStockLevels(locationId?: string): Observable<StockLevel[]>` - Get stock levels
- `adjustStock(partId: string, locationId: string, quantity: number, reason: string): Promise<void>` - Adjust stock
- `transferStock(partId: string, fromLocationId: string, toLocationId: string, quantity: number): Promise<void>` - Transfer between locations
- `getLowStockParts(): Observable<Part[]>` - Get parts below minimum threshold
- `getCategories(): Observable<string[]>` - Get all categories
- `getTags(): Observable<string[]>` - Get all tags

### 4.2 CheckoutService

**Purpose:** Handles checkout/return workflows for technicians.

**Key Methods:**
- `createCheckoutSession(technicianId: string, items: CheckoutItem[]): Promise<CheckoutSession>` - Create checkout
- `getActiveCheckouts(technicianId?: string): Observable<CheckoutSession[]>` - Get active checkouts
- `returnParts(sessionId: string, returns: PartReturn[]): Promise<void>` - Return parts
- `markPartAsUsed(sessionId: string, partId: string, quantity: number): Promise<void>` - Mark part used
- `completeCheckoutSession(sessionId: string): Promise<void>` - Complete session
- `getTechnicianInventory(technicianId: string): Observable<StockLevel[]>` - Get tech's inventory
- `getPartsNeedingReturn(technicianId: string): Observable<CheckoutItem[]>` - Get parts to return

### 4.3 UsageTrackingService

**Purpose:** Tracks part usage on work orders in real-time.

**Key Methods:**
- `recordPartUsage(usage: PartUsage): Promise<void>` - Record part usage
- `getWorkOrderUsage(workOrderId: string): Observable<PartUsage[]>` - Get usage for work order
- `getTechnicianUsage(technicianId: string, dateRange?: DateRange): Observable<PartUsage[]>` - Get tech usage
- `recordSerializedPartInstallation(data: SerializedPartInstallation): Promise<void>` - Record serial install
- `getSerializedPartHistory(serialNumber: string): Observable<SerializedPart>` - Get serial history
- `uploadBeforePhoto(usageId: string, photo: Photo): Promise<string>` - Upload before photo
- `uploadAfterPhoto(usageId: string, photo: Photo): Promise<string>` - Upload after photo
- `captureCustomerApproval(usageId: string, signatureDataUrl: string): Promise<void>` - Capture signature

### 4.4 AnalyticsService

**Purpose:** Generates reports, forecasts, and insights.

**Key Methods:**
- `getInventoryValuation(locationId?: string): Promise<InventoryValuation>` - Get inventory value
- `getUsageReport(dateRange: DateRange): Promise<UsageReport>` - Get usage report
- `getCostPerWorkOrder(workOrderId: string): Promise<number>` - Get cost for work order
- `getMostUsedParts(limit: number, dateRange?: DateRange): Promise<PartUsageStats[]>` - Most used parts
- `getPartConsumptionTrends(partId: string, months: number): Promise<ConsumptionTrend[]>` - Consumption trends
- `calculateCOGS(dateRange: DateRange): Promise<number>` - Cost of goods sold
- `getProfitMarginByWorkOrder(workOrderId: string): Promise<ProfitMargin>` - Profit margin
- `forecastPartNeeds(partId: string, months: number): Promise<ForecastData>` - Forecast needs
- `getSlowMovingInventory(daysThreshold: number): Promise<Part[]>` - Slow-moving parts
- `calculateROI(dateRange: DateRange): Promise<ROIAnalysis>` - ROI analysis

### 4.5 RmaService

**Purpose:** Manages return merchandise authorization for defective parts.

**Key Methods:**
- `createRmaRequest(request: Omit<RmaRequest, 'id' | 'requestDate' | 'status'>): Promise<RmaRequest>` - Create RMA
- `getRmaRequests(status?: string): Observable<RmaRequest[]>` - Get RMA requests
- `updateRmaStatus(id: string, status: string, notes?: string): Promise<void>` - Update status
- `uploadRmaPhoto(id: string, photo: Photo): Promise<string>` - Upload photo
- `recordResolution(id: string, resolution: RmaResolution): Promise<void>` - Record resolution
- `processReplacement(id: string, newPartId: string, serialNumber?: string): Promise<void>` - Process replacement

---

## 5. User Workflows

### 5.1 Technician Checks Out Parts

1. Navigate to `/inventory`
2. Browse parts visually (grid with photos) or search
3. Filter by category/tags/equipment compatibility
4. Click "Add to Checkout" on needed parts
5. Specify quantity for each part
6. Review checkout cart
7. Submit checkout request
8. System creates CheckoutSession (status: ACTIVE)
9. Stock reserved in warehouse, added to technician's inventory
10. Confirmation shown with checkout session ID

### 5.2 Technician Uses Part on Work Order

1. Open work order detail page
2. Scroll to "Parts Used" section
3. Click "Add Part"
4. Select part from their inventory (visual picker)
5. Enter quantity used
6. For serialized parts: scan or enter serial number
7. Add reason for use
8. (Optional) Take before photo
9. Mark part as used - real-time update
10. After installation: take after photo
11. (Optional) Capture customer signature for approval
12. System records PartUsage and updates checkout session
13. Unused parts automatically flagged for return

### 5.3 Technician Returns Unused Parts

1. Navigate to `/inventory/my-inventory`
2. View "Parts Needing Return" section
3. System shows all checked-out but unused parts
4. Click "Return Parts"
5. Review list, adjust quantities if needed
6. For damaged parts: mark condition and upload photo
7. Submit return
8. System updates checkout session
9. Stock transferred back to warehouse
10. Damaged parts trigger RMA workflow if needed

### 5.4 Creating RMA for Defective Part

1. Navigate to `/inventory/rma`
2. Click "Create RMA Request"
3. Select part (from inventory or by part number)
4. Enter serial number if applicable
5. Select reason (DEFECTIVE, DAMAGED, etc.)
6. Write description
7. Take photos of defect
8. Submit request
9. System generates RMA number
10. Admin reviews and approves
11. System tracks RMA status through completion

---

## 6. Component Structure

### 6.1 Pages

1. **Inventory List Page** (`/inventory`)
   - Visual grid/list of parts with photos
   - Search and filter sidebar
   - Stock level indicators
   - Quick actions (checkout, view details)

2. **Part Detail Page** (`/inventory/:id`)
   - Part information and specifications
   - Stock levels across locations
   - Equipment compatibility
   - Alternative parts
   - Usage history
   - Photos gallery

3. **Checkout Page** (`/inventory/checkout`)
   - Select parts to checkout
   - Quantity selection
   - Review and confirm
   - Active checkout sessions

4. **My Inventory Page** (`/inventory/my-inventory`)
   - Technician's current inventory
   - Parts needing return
   - Quick usage tracking
   - Return workflow

5. **Analytics Dashboard** (`/inventory/analytics`)
   - Key metrics cards
   - Usage charts
   - Cost analysis
   - Forecasting graphs

6. **RMA Management** (`/inventory/rma`)
   - Create RMA request
   - Track RMA status
   - Upload photos
   - Resolution tracking

### 6.2 Reusable Components

- `PartCardComponent` - Visual card for browsing parts
- `CheckoutCartComponent` - Checkout cart with items
- `PartUsageTrackerComponent` - Embedded in work order detail
- `StockLevelIndicatorComponent` - Visual stock indicator
- `PartFilterSidebarComponent` - Filter controls
- `AnalyticsDashboardComponent` - Metrics and charts
- `RmaFormComponent` - RMA request form
- `SerialNumberScannerComponent` - Scan/enter serial numbers

---

## 7. Offline Support & Sync Strategy

### 7.1 Sync Queue Operations

```typescript
enum InventorySyncOperation {
  CHECKOUT_PARTS = 'CHECKOUT_PARTS',
  RETURN_PARTS = 'RETURN_PARTS',
  USE_PART = 'USE_PART',
  ADJUST_STOCK = 'ADJUST_STOCK',
  CREATE_RMA = 'CREATE_RMA',
  UPDATE_SERIALIZED_PART = 'UPDATE_SERIALIZED_PART'
}
```

### 7.2 Conflict Detection

**Scenario 1: Insufficient Stock**
- Two technicians try to checkout last part
- First checkout succeeds, second gets partial checkout
- User notified of partial fulfillment

**Scenario 2: Part Not Checked Out**
- Technician tries to use part not in their inventory
- Usage rejected, user prompted to checkout first

**Scenario 3: Quantity Mismatch**
- Technician tries to use more than checked out
- Usage adjusted to available quantity
- User notified of adjustment

### 7.3 Offline Capabilities

**Fully Offline:**
- Browse parts catalog (cached)
- View technician inventory
- Mark parts as used
- Create checkout requests (queued)
- Create RMA requests (queued)
- Take photos (stored locally)

**Sync When Online:**
- Upload queued operations
- Resolve conflicts
- Update stock levels
- Upload photos
- Refresh analytics

---

## 8. Database Schema (Supabase)

### 8.1 Tables

**parts**
- Primary key: `id` (UUID)
- Unique: `part_number`
- Indexes: `category`, `tags` (GIN)

**stock_locations**
- Primary key: `id` (UUID)
- Foreign key: `technician_id` → `profiles(id)`

**stock_levels**
- Primary key: `id` (UUID)
- Foreign keys: `part_id` → `parts(id)`, `location_id` → `stock_locations(id)`
- Unique: `(part_id, location_id)`
- Indexes: `part_id`, `location_id`

**checkout_sessions**
- Primary key: `id` (UUID)
- Foreign keys: `technician_id` → `profiles(id)`, `from_location_id` → `stock_locations(id)`, `to_location_id` → `stock_locations(id)`
- Indexes: `technician_id`, `status`

**part_usage**
- Primary key: `id` (UUID)
- Foreign keys: `work_order_id` → `work_orders(id)`, `part_id` → `parts(id)`, `technician_id` → `profiles(id)`, `checkout_session_id` → `checkout_sessions(id)`
- Indexes: `work_order_id`, `part_id`

**serialized_parts**
- Primary key: `id` (UUID)
- Foreign keys: `part_id` → `parts(id)`, `current_location_id` → `stock_locations(id)`
- Unique: `serial_number`
- Index: `serial_number`

**rma_requests**
- Primary key: `id` (UUID)
- Foreign keys: `part_id` → `parts(id)`, `requested_by` → `profiles(id)`
- Index: `status`

### 8.2 Row Level Security (RLS)

**Technicians:**
- Read: Own inventory, all parts catalog
- Write: Own checkout sessions, part usage, RMA requests

**Admins:**
- Read: All data
- Write: All data

---

## 9. UI Design Principles

### 9.1 Visual-First Approach

- **Photo-based catalog:** Large thumbnails, grid layout
- **Visual stock indicators:** Color-coded (green=good, yellow=low, red=critical)
- **Image galleries:** Before/after photos, defect photos
- **Chart visualizations:** Usage trends, forecasts

### 9.2 Mobile Optimization

- **Touch-friendly:** 44px minimum touch targets
- **Swipe gestures:** Swipe to return parts, swipe to delete
- **Quick actions:** Long-press for context menu
- **Offline indicators:** Clear visual feedback when offline

### 9.3 Glassmorphism Theme

- Consistent with existing app design
- Dark theme with neon accents
- Glass panels with backdrop blur
- Smooth animations and transitions

---

## 10. Success Criteria

### 10.1 Functional Requirements

✅ Technicians can checkout parts from warehouse  
✅ Technicians can mark parts as used on work orders in real-time  
✅ Unused parts automatically flagged for return  
✅ Serialized parts tracked through full lifecycle  
✅ RMA workflow for defective parts  
✅ Low stock alerts when below threshold  
✅ Analytics dashboard with key metrics  
✅ Full offline support with sync queue  
✅ Conflict detection and resolution  

### 10.2 Performance Requirements

- Part search results < 500ms
- Checkout operation < 1s
- Photo upload with progress indicator
- Offline operations instant (queued)
- Analytics dashboard load < 2s

### 10.3 User Experience Requirements

- Visual part browsing (no need to know part numbers)
- Maximum 3 taps to checkout a part
- Real-time usage tracking during work order
- Clear visual feedback for all operations
- Intuitive return workflow

---

## 11. Implementation Phases

### Phase 1: Core Inventory (Days 1-3)
- Data models and repositories
- InventoryService
- Parts catalog UI
- Stock level management
- Basic search and filters

### Phase 2: Checkout/Return (Days 3-5)
- CheckoutService
- Checkout workflow UI
- Return workflow UI
- Technician inventory view
- Sync queue integration

### Phase 3: Usage Tracking (Days 5-7)
- UsageTrackingService
- Part usage UI in work order detail
- Photo capture integration
- Customer signature capture
- Serialized part tracking

### Phase 4: Analytics & RMA (Days 7-9)
- AnalyticsService
- RmaService
- Analytics dashboard UI
- RMA workflow UI
- Reports generation

### Phase 5: Testing & Polish (Days 9-10)
- Offline testing
- Conflict resolution testing
- Performance optimization
- UI polish
- Documentation

---

## 12. Technical Considerations

### 12.1 Scalability

- Pagination for large parts catalogs
- Virtual scrolling for long lists
- Lazy loading for images
- Indexed database queries

### 12.2 Security

- RLS policies for data access
- Photo upload validation
- Input sanitization
- Audit logging for stock adjustments

### 12.3 Maintainability

- Modular service architecture
- Clear separation of concerns
- Comprehensive TypeScript types
- Unit tests for services
- Integration tests for workflows

---

## 13. Future Enhancements

**Not in Initial Scope:**
- Barcode scanning for parts
- Voice notes for usage documentation
- Automated reordering
- Multi-level approval workflows
- Advanced forecasting with ML
- Integration with accounting systems
- Supplier portal integration

---

## 14. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Complex offline sync conflicts | High | Implement robust conflict detection and resolution |
| Large photo uploads on slow networks | Medium | Compress images, show progress, allow retry |
| Analytics performance with large datasets | Medium | Use database aggregations, caching, pagination |
| User adoption of new workflow | Medium | Intuitive UI, training materials, gradual rollout |
| Data migration from existing system | Low | Not applicable (new feature) |

---

## 15. Dependencies

**External:**
- Supabase (database, storage, auth)
- Capacitor Camera plugin (existing)
- Angular 21 (existing)

**Internal:**
- PhotoService (existing)
- SyncService (existing)
- NetworkService (existing)
- ToastService (existing)
- HapticService (existing)

---

## 16. Acceptance Criteria

**Admin can:**
- ✅ Add/edit/delete parts in catalog
- ✅ View inventory across all locations
- ✅ Adjust stock levels with reason
- ✅ Approve/reject RMA requests
- ✅ View analytics and reports

**Technician can:**
- ✅ Browse parts visually with filters
- ✅ Checkout parts from warehouse
- ✅ View their current inventory
- ✅ Mark parts as used on work orders
- ✅ Take before/after photos
- ✅ Capture customer signatures
- ✅ Return unused parts
- ✅ Create RMA requests for defective parts
- ✅ Work fully offline with sync when online

**System must:**
- ✅ Track stock levels accurately
- ✅ Prevent negative stock
- ✅ Detect and resolve conflicts
- ✅ Generate low stock alerts
- ✅ Calculate costs and margins
- ✅ Forecast future needs
- ✅ Maintain audit trail

---

**End of Design Specification**

*This document will be used as the foundation for implementation planning and development.*
