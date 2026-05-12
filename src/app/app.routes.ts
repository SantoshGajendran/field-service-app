import { Routes } from '@angular/router';
import { WorkOrderListComponent } from './features/work-orders/containers/work-order-list/work-order-list.component';
import { WorkOrderDetailComponent } from './features/work-orders/containers/work-order-detail/work-order-detail.component';
import { ProfileComponent } from './features/profile/profile.component';
import { LoginComponent } from './features/login/login.component';
import { AdminComponent } from './features/admin/admin.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'admin', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [authGuard]
  },
  {
    path: 'work-orders',
    component: WorkOrderListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'work-orders/:id',
    component: WorkOrderDetailComponent,
    canActivate: [authGuard]
  },
  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard]
  },
  {
    path: 'inventory',
    loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'admin'
  }
];
