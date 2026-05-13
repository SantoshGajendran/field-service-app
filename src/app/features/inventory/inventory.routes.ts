import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./containers/inventory-list/inventory-list.component').then(
        (m) => m.InventoryListComponent
      ),
  },
  {
    path: 'part/:id',
    loadComponent: () =>
      import('./containers/part-detail/part-detail.component').then(
        (m) => m.PartDetailComponent
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./containers/checkout/checkout.component').then(
        (m) => m.CheckoutComponent
      ),
  },
  {
    path: 'my-inventory',
    loadComponent: () =>
      import('./containers/my-inventory/my-inventory.component').then(
        (m) => m.MyInventoryComponent
      ),
  },
  {
    path: 'analytics',
    loadComponent: () =>
      import('./containers/analytics-dashboard/analytics-dashboard.component').then(
        (m) => m.AnalyticsDashboardComponent
      ),
  },
  {
    path: 'rma',
    loadComponent: () =>
      import('./containers/rma-management/rma-management.component').then(
        (m) => m.RmaManagementComponent
      ),
  },
  {
    path: 'seed',
    loadComponent: () =>
      import('./containers/data-seed/data-seed.component').then(
        (m) => m.DataSeedComponent
      ),
  },
];
