import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppLayoutComponent } from './shared/components/app-layout/app-layout.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';
import { DatabaseInitService } from './shared/services/database-init.service';
import { PushNotificationService } from './core/services/push-notification.service';
import { AuthService } from './core/services/auth.service';
import { filter, distinctUntilChanged } from 'rxjs/operators';

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
  private authService = inject(AuthService);
  private router = inject(Router);

  showLayout = false;
  private userInteracted = false;

  constructor() {
    this.showLayout = !this.router.url.includes('/login');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.showLayout = !event.url.includes('/login');

      if (this.showLayout && this.authService.isAuthenticated()) {
        this.initializeNotifications();
      }
    });
  }

  async ngOnInit() {
    await this.dbInitService.seedInitialData();

    if (this.authService.isAuthenticated()) {
      this.initializeNotifications();
    }

    this.authService.authState$.pipe(
      distinctUntilChanged((prev, curr) => prev.isAuthenticated === curr.isAuthenticated)
    ).subscribe(authState => {
      if (authState.isAuthenticated && this.showLayout) {
        this.initializeNotifications();
      }
    });

    document.addEventListener('click', () => {
      this.userInteracted = true;
    }, { once: true });
  }

  private async initializeNotifications(): Promise<void> {
    if (!this.userInteracted) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    if (this.userInteracted || this.router.url !== '/login') {
      await this.pushNotificationService.initialize();
    }
  }
}
