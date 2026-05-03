# Project Structure Documentation

**Date:** May 2, 2026  
**Status:** ✅ Well-Organized

---

## Current Project Structure

```
field-service-app/
├── src/
│   ├── app/
│   │   ├── core/                           # Core business logic (singleton services)
│   │   │   ├── guards/
│   │   │   │   └── auth.guard.ts          # Route protection
│   │   │   ├── models/
│   │   │   │   ├── checklist.model.ts     # Checklist data model
│   │   │   │   ├── sync-item.model.ts     # Sync queue item model
│   │   │   │   ├── user.model.ts          # User & auth models
│   │   │   │   └── work-order.model.ts    # Work order model
│   │   │   ├── repositories/
│   │   │   │   ├── checklist.repository.ts    # Checklist data access
│   │   │   │   ├── sync-queue.repository.ts   # Sync queue data access
│   │   │   │   └── work-order.repository.ts   # Work order data access
│   │   │   └── services/
│   │   │       ├── auth.service.ts        # Authentication service
│   │   │       ├── network.service.ts     # Network status monitoring
│   │   │       ├── storage.service.ts     # LocalForage wrapper
│   │   │       ├── sync.service.ts        # Offline sync service
│   │   │       └── theme.service.ts       # Theme management
│   │   │
│   │   ├── features/                       # Feature modules
│   │   │   ├── admin/
│   │   │   │   └── admin.component.ts     # Admin dashboard
│   │   │   ├── inventory/
│   │   │   │   └── inventory.component.ts # Inventory page (placeholder)
│   │   │   ├── login/
│   │   │   │   └── login.component.ts     # Login page
│   │   │   ├── profile/
│   │   │   │   └── profile.component.ts   # User profile page
│   │   │   └── work-orders/
│   │   │       ├── components/            # Presentational components
│   │   │       │   ├── checklist/
│   │   │       │   │   └── checklist.component.ts
│   │   │       │   └── work-order-card/
│   │   │       │       └── work-order-card.component.ts
│   │   │       └── containers/            # Smart components
│   │   │           ├── work-order-detail/
│   │   │           │   └── work-order-detail.component.ts
│   │   │           └── work-order-list/
│   │   │               └── work-order-list.component.ts
│   │   │
│   │   ├── shared/                         # Shared across features
│   │   │   ├── components/
│   │   │   │   ├── app-layout/
│   │   │   │   │   └── app-layout.component.ts
│   │   │   │   └── sync-queue-viewer/
│   │   │   │       └── sync-queue-viewer.component.ts
│   │   │   └── services/
│   │   │       └── database-init.service.ts
│   │   │
│   │   ├── app.component.ts               # Root component (unused)
│   │   ├── app.config.ts                  # App configuration
│   │   ├── app.routes.ts                  # Route definitions
│   │   ├── app.spec.ts                    # Root tests
│   │   └── app.ts                         # Main app component
│   │
│   ├── styles.scss                        # Global styles & design system
│   ├── index.html                         # HTML entry point
│   └── main.ts                            # Bootstrap entry point
│
├── docs/                                   # Documentation
│   ├── ADMIN_DASHBOARD_GUIDE.md
│   ├── APPLICATION_ANALYSIS_REPORT.md
│   ├── AUTHENTICATION_GUIDE.md
│   ├── CELEBRATION.md
│   ├── COMPLETE_IMPROVEMENTS_SUMMARY.md
│   ├── FEATURE_RECOMMENDATIONS.md
│   ├── FILTER_IMPLEMENTATION.md
│   ├── PROJECT_COMPLETION_REPORT.md
│   ├── QUICK_START_GUIDE.md
│   ├── TECHNICAL_IMPROVEMENTS.md
│   ├── UI_DESIGN_GUIDE.md
│   └── UI_IMPROVEMENTS_SUMMARY.md
│
├── android/                               # Capacitor Android
├── capacitor.config.ts                    # Capacitor configuration
├── package.json                           # Dependencies
├── tsconfig.json                          # TypeScript config
├── angular.json                           # Angular CLI config
└── README.md                              # Project overview
```

---

## Architecture Patterns

### 1. Core Module
**Purpose:** Singleton services and app-wide functionality

**Contains:**
- **Guards:** Route protection (auth.guard.ts)
- **Models:** Data interfaces and types
- **Repositories:** Data access layer (Repository Pattern)
- **Services:** Business logic services

**Rules:**
- Services are `providedIn: 'root'` (singleton)
- Never import feature modules
- Only imported once in the app

### 2. Features Module
**Purpose:** Feature-specific components and logic

**Structure:**
```
features/
├── feature-name/
│   ├── components/      # Presentational (dumb) components
│   ├── containers/      # Smart components with logic
│   ├── services/        # Feature-specific services
│   └── feature.component.ts
```

**Current Features:**
- **admin** - Administrator dashboard
- **inventory** - Inventory management (placeholder)
- **login** - Authentication
- **profile** - User profile & settings
- **work-orders** - Work order management (main feature)

**Rules:**
- Features are independent and self-contained
- Can import from core and shared
- Should not import from other features

### 3. Shared Module
**Purpose:** Reusable components and utilities

**Contains:**
- **Components:** UI components used across features
- **Services:** Utility services
- **Directives:** Custom directives
- **Pipes:** Custom pipes

**Rules:**
- No business logic
- Highly reusable
- Can be imported by any feature

---

## Design Patterns Used

### 1. Repository Pattern
**Location:** `core/repositories/`

**Purpose:** Abstract data access layer

**Example:**
```typescript
@Injectable({ providedIn: 'root' })
export class WorkOrderRepository {
  private workOrdersSubject = new BehaviorSubject<WorkOrder[]>([]);
  public workOrders$ = this.workOrdersSubject.asObservable();
  
  async getAll(): Promise<WorkOrder[]> { }
  async getById(id: string): Promise<WorkOrder | null> { }
  async save(workOrder: WorkOrder): Promise<void> { }
}
```

**Benefits:**
- Separation of concerns
- Easy to test
- Can swap storage implementations

### 2. Smart/Dumb Components
**Location:** `features/*/components/` (dumb) and `features/*/containers/` (smart)

**Smart Components (Containers):**
- Handle business logic
- Interact with services
- Manage state
- Example: `work-order-list.component.ts`

**Dumb Components (Presentational):**
- Pure presentation
- Input/Output only
- No service injection
- Example: `work-order-card.component.ts`

### 3. Reactive Programming
**Pattern:** RxJS Observables

**Usage:**
```typescript
// Services expose observables
public workOrders$ = this.workOrdersSubject.asObservable();

// Components subscribe
this.workOrderRepo.workOrders$.subscribe(orders => {
  // Handle data
});
```

### 4. Dependency Injection
**Pattern:** Angular DI

**Usage:**
```typescript
export class MyComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
}
```

---

## File Naming Conventions

### Components
```
feature-name.component.ts       # Component class
feature-name.component.html     # Template (if separate)
feature-name.component.scss     # Styles (if separate)
feature-name.component.spec.ts  # Tests
```

### Services
```
service-name.service.ts
service-name.service.spec.ts
```

### Models
```
model-name.model.ts
```

### Guards
```
guard-name.guard.ts
```

### Repositories
```
entity-name.repository.ts
```

---

## Code Organization Best Practices

### 1. Standalone Components
All components use standalone: true

```typescript
@Component({
  selector: 'app-feature',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `...`
})
```

### 2. Inline Templates for Small Components
Components with < 50 lines use inline templates

### 3. Separate Files for Large Components
Components with > 50 lines use separate template files

### 4. Barrel Exports (Future Enhancement)
Create index.ts files for cleaner imports:

```typescript
// core/models/index.ts
export * from './user.model';
export * from './work-order.model';

// Usage
import { User, WorkOrder } from '@app/core/models';
```

---

## Dependency Flow

```
┌─────────────────────────────────────────┐
│              Features                    │
│  (admin, login, profile, work-orders)   │
└─────────────┬───────────────────────────┘
              │ imports
              ↓
┌─────────────────────────────────────────┐
│              Shared                      │
│    (components, services, pipes)        │
└─────────────┬───────────────────────────┘
              │ imports
              ↓
┌─────────────────────────────────────────┐
│              Core                        │
│  (services, models, guards, repos)      │
└─────────────────────────────────────────┘
```

**Rules:**
- Core never imports from Features or Shared
- Shared never imports from Features
- Features can import from Core and Shared
- Features should not import from other Features

---

## State Management

### Current Approach: Service-Based State

**Pattern:**
```typescript
@Injectable({ providedIn: 'root' })
export class StateService {
  private stateSubject = new BehaviorSubject<State>(initialState);
  public state$ = this.stateSubject.asObservable();
  
  updateState(newState: State) {
    this.stateSubject.next(newState);
  }
}
```

**Used in:**
- AuthService (auth state)
- ThemeService (theme state)
- WorkOrderRepository (work orders)
- SyncQueueRepository (sync queue)

**Benefits:**
- Simple and lightweight
- No external dependencies
- Reactive with RxJS
- Easy to understand

---

## Routing Structure

```typescript
routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  { path: 'admin', component: AdminComponent, canActivate: [authGuard] },
  { path: 'work-orders', component: WorkOrderListComponent, canActivate: [authGuard] },
  { path: 'work-orders/:id', component: WorkOrderDetailComponent, canActivate: [authGuard] },
  { path: 'inventory', component: InventoryComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: 'admin' }
];
```

**Features:**
- Lazy loading ready (can be converted to loadComponent)
- Route guards for protection
- Parameterized routes for details
- Wildcard redirect

---

## Testing Structure

### Unit Tests
**Location:** Next to source files (*.spec.ts)

**Example:**
```
work-order.service.ts
work-order.service.spec.ts
```

### Integration Tests
**Location:** `src/app/tests/integration/`

### E2E Tests
**Location:** `e2e/`

---

## Build & Deployment

### Development Build
```bash
npm start                    # Dev server
npm run build               # Production build
```

### Output Structure
```
dist/field-service-app/
├── browser/                # Browser bundle
│   ├── index.html
│   ├── main.js
│   ├── styles.css
│   └── assets/
└── server/                 # SSR (if enabled)
```

---

## Environment Configuration

### Current Setup
- Single environment (development)
- Mock data and services
- LocalForage for storage

### Future: Multiple Environments
```
src/environments/
├── environment.ts          # Development
├── environment.staging.ts  # Staging
└── environment.prod.ts     # Production
```

---

## Key Architectural Decisions

### 1. Standalone Components
**Decision:** Use standalone components instead of NgModules

**Rationale:**
- Simpler architecture
- Better tree-shaking
- Easier to understand
- Angular's recommended approach

### 2. Repository Pattern
**Decision:** Abstract data access with repositories

**Rationale:**
- Separation of concerns
- Easy to swap storage (LocalForage → API)
- Testable
- Clear data flow

### 3. Offline-First
**Decision:** LocalForage + Sync Queue

**Rationale:**
- Field technicians work in areas with poor connectivity
- Better user experience
- Data persistence
- Background sync

### 4. Reactive State
**Decision:** RxJS BehaviorSubjects for state

**Rationale:**
- Reactive updates
- No external state library needed
- Angular-native approach
- Easy to debug

### 5. Glassmorphism Design
**Decision:** Dark theme with glassmorphism

**Rationale:**
- Modern aesthetic
- Professional appearance
- Good contrast for outdoor use
- Distinctive brand identity

---

## Code Quality Standards

### TypeScript
- Strict mode enabled
- No `any` types in business logic
- Explicit return types for public methods
- Interface for all data models

### Components
- Single responsibility
- Max 300 lines per component
- Inline templates for < 50 lines
- Separate files for > 50 lines

### Services
- Injectable with providedIn: 'root'
- Public API documented
- Error handling
- Observable-based

### Naming
- PascalCase for classes
- camelCase for variables/methods
- kebab-case for files
- UPPER_SNAKE_CASE for constants

---

## Performance Optimizations

### 1. OnPush Change Detection
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### 2. TrackBy Functions
```typescript
trackByWorkOrderId(index: number, item: WorkOrder): string {
  return item.id;
}
```

### 3. Lazy Loading
Routes can be converted to lazy loading:
```typescript
{
  path: 'admin',
  loadComponent: () => import('./features/admin/admin.component')
    .then(m => m.AdminComponent)
}
```

### 4. Virtual Scrolling
For large lists (future enhancement)

---

## Security Considerations

### Current Implementation
- Route guards (authGuard)
- Token-based auth (mock)
- LocalStorage for session
- Role-based access control

### Production Recommendations
- HTTPS only
- HttpOnly cookies for tokens
- CSRF protection
- XSS prevention
- Input sanitization
- Rate limiting

---

## Accessibility (a11y)

### Current Implementation
- Semantic HTML
- ARIA labels on interactive elements
- Keyboard navigation support
- Focus management
- Color contrast (WCAG AA)

### Future Enhancements
- Screen reader testing
- ARIA live regions
- Skip links
- Focus trapping in modals

---

## Summary

The project follows a **well-organized, scalable architecture** with:

✅ Clear separation of concerns (Core/Features/Shared)  
✅ Repository pattern for data access  
✅ Smart/Dumb component pattern  
✅ Reactive state management with RxJS  
✅ Standalone components (modern Angular)  
✅ Offline-first architecture  
✅ Role-based authentication  
✅ Comprehensive documentation  
✅ Production-ready structure  

The architecture is designed to scale as the application grows, with clear patterns and conventions that make it easy for developers to understand and extend.

---

**Project Structure Documentation**  
*Version 1.0.0 - May 2, 2026*  
*Field Service Application*
