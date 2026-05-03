import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { DatabaseInitService } from './shared/services/database-init.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, AppLayoutComponent, RouterOutlet, ToastContainerComponent],
  template: `
    <app-layout *ngIf="showLayout">
      <router-outlet></router-outlet>
    </app-layout>
    <router-outlet *ngIf="!showLayout"></router-outlet>
    <app-toast-container></app-toast-container>
  `,
  styles: []
})
export class App implements OnInit {
  private dbInitService = inject(DatabaseInitService);
  private pushNotificationService = inject(PushNotificationService);
  private router = inject(Router);

  showLayout = false;

  constructor() {
    // Check initial route immediately
    this.showLayout = !this.router.url.includes('/login');

    // Listen to route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLayout = !event.url.includes('/login');
    });
  }

  async ngOnInit() {
    await this.dbInitService.seedInitialData();

    // Initialize push notifications after login
    if (this.showLayout) {
      await this.pushNotificationService.initialize();
    }
  }
}
