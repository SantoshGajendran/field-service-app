import { Injectable, NgZone, inject } from '@angular/core';
import { PushNotifications, PermissionStatus, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ToastService } from './toast.service';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  type: 'work_order_assigned' | 'status_changed' | 'priority_update' | 'admin_message';
  data?: any;
  timestamp: Date;
  read: boolean;
}

export type NotificationPermissionState = 'granted' | 'denied' | 'prompt' | 'denied_forever';

interface NotificationPreferences {
  permissionState: NotificationPermissionState;
  tokenRegistered: boolean;
  fcmToken: string | null;
  lastPermissionAsk: number;
  showSoftPrompt: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private router = inject(Router);
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private permissionStateSubject = new BehaviorSubject<NotificationPermissionState>('prompt');
  public permissionState$ = this.permissionStateSubject.asObservable();

  private initialized = false;
  private initializationPromise: Promise<void> | null = null;

  private readonly PREFS_KEY = 'notification_prefs';
  private readonly PERMISSION_ASK_DELAY_MS = 3000;
  private readonly SOFT_PROMPT_DELAY_MS = 86400000;
  private readonly TOKEN_REFRESH_THRESHOLD_DAYS = 30;

  constructor() {
    this.loadPreferences();
    this.setupRouteListener();
    this.loadNotifications();
  }

  private setupRouteListener(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      if (this.initialized && this.isAuthenticatedRoute(event.url)) {
        this.checkAndPromptPermission();
      }
    });
  }

  private isAuthenticatedRoute(url: string): boolean {
    const authenticatedRoutes = ['/work-orders', '/inventory', '/profile', '/admin', '/notifications'];
    return authenticatedRoutes.some(route => url.includes(route)) && !url.includes('/login');
  }

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem(this.PREFS_KEY);
      if (saved) {
        const prefs: NotificationPreferences = JSON.parse(saved);
        this.permissionStateSubject.next(prefs.permissionState);
      }
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  }

  private savePreferences(prefs: NotificationPreferences): void {
    try {
      localStorage.setItem(this.PREFS_KEY, JSON.stringify(prefs));
    } catch (error) {
      console.error('Error saving notification preferences:', error);
    }
  }

  private getPreferences(): NotificationPreferences {
    try {
      const saved = localStorage.getItem(this.PREFS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error getting preferences:', error);
    }
    return {
      permissionState: 'prompt',
      tokenRegistered: false,
      fcmToken: null,
      lastPermissionAsk: 0,
      showSoftPrompt: false
    };
  }

  private updatePreferences(updates: Partial<NotificationPreferences>): void {
    const prefs = this.getPreferences();
    this.savePreferences({ ...prefs, ...updates });
  }

  async initialize(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    if (this.initialized) {
      return;
    }

    this.initialized = true;
    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      await this.checkCurrentPermission();
    } catch (error) {
      console.error('Error checking initial permission:', error);
    }
  }

  private async checkCurrentPermission(): Promise<NotificationPermissionState> {
    try {
      const permission = await PushNotifications.checkPermissions();
      let state: NotificationPermissionState;

switch (permission.receive) {
        case 'granted':
          state = 'granted';
          break;
        case 'denied':
          state = 'denied_forever';
          this.showSoftPromptIfNeeded();
          break;
        case 'prompt':
        default:
          state = 'prompt';
      }

      this.permissionStateSubject.next(state);
      const prefs = this.getPreferences();
      this.savePreferences({ ...prefs, permissionState: state });

      return state;
    } catch (error) {
      console.error('Error checking permission:', error);
      return 'prompt';
    }
  }

  async checkAndPromptPermission(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    const prefs = this.getPreferences();

    if (prefs.permissionState === 'granted') {
      await this.registerDevice();
      return;
    }

    if (prefs.permissionState === 'denied_forever') {
      this.scheduleSoftPromptIfNeeded();
      return;
    }

    if (prefs.permissionState === 'denied') {
      this.scheduleSoftPromptIfNeeded();
      return;
    }

    const now = Date.now();
    if (prefs.lastPermissionAsk > 0 && (now - prefs.lastPermissionAsk) < 60000) {
      return;
    }

    setTimeout(async () => {
      await this.requestPermission();
    }, this.PERMISSION_ASK_DELAY_MS);
  }

  private async requestPermission(): Promise<NotificationPermissionState> {
    if (!Capacitor.isNativePlatform()) {
      return 'prompt';
    }

    this.updatePreferences({ lastPermissionAsk: Date.now() });

    try {
      const permission = await PushNotifications.requestPermissions();

      let state: NotificationPermissionState;
      let shouldRegister = false;

      switch (permission.receive) {
        case 'granted':
          state = 'granted';
          shouldRegister = true;
          break;
        case 'denied':
          state = 'denied_forever';
          this.showSoftPromptIfNeeded();
          break;
        case 'prompt':
        default:
          state = 'prompt';
      }

      this.permissionStateSubject.next(state);
      this.updatePreferences({ permissionState: state });

      if (shouldRegister) {
        await this.registerDevice();
      }

      return state;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return 'denied';
    }
  }

  private async registerDevice(): Promise<void> {
    const prefs = this.getPreferences();

    if (prefs.tokenRegistered && prefs.fcmToken && this.isTokenRecent(prefs.fcmToken)) {
      console.log('Token already registered and recent');
      return;
    }

    try {
      await PushNotifications.register();

      PushNotifications.addListener('registration', async (token: Token) => {
        console.log('Push registration success, token:', token.value);
        this.ngZone.run(() => {
          this.updatePreferences({
            fcmToken: token.value,
            tokenRegistered: true
          });
          this.sendTokenToServer(token.value);
        });
      });

      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration:', JSON.stringify(error));
        this.ngZone.run(() => {
          this.toastService.error('Failed to register for push notifications');
        });
      });

      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        this.ngZone.run(() => {
          this.handleNotificationReceived(notification);
        });
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        this.ngZone.run(() => {
          this.handleNotificationAction(notification);
        });
      });

    } catch (error) {
      console.error('Error registering device:', error);
    }
  }

  private isTokenRecent(token: string): boolean {
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.iat) {
          const tokenAge = Date.now() / 1000 - payload.iat;
          return tokenAge < (this.TOKEN_REFRESH_THRESHOLD_DAYS * 24 * 60 * 60);
        }
      }
      const stored = localStorage.getItem(`token_age_${token.substring(0, 20)}`);
      if (stored) {
        const age = Date.now() - parseInt(stored, 10);
        return age < (this.TOKEN_REFRESH_THRESHOLD_DAYS * 24 * 60 * 60 * 1000);
      }
    } catch {
    }
    return false;
  }

  private sendTokenToServer(token: string): void {
    try {
      localStorage.setItem(`token_age_${token.substring(0, 20)}`, Date.now().toString());
      localStorage.setItem('fcm_token', token);
      console.log('FCM Token saved to localStorage:', token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  async refreshToken(): Promise<void> {
    const prefs = this.getPreferences();
    if (prefs.permissionState !== 'granted') {
      return;
    }

    try {
      const permission = await PushNotifications.checkPermissions();
      if (permission.receive === 'granted') {
        await PushNotifications.register();
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }

  private handleNotificationReceived(notification: PushNotificationSchema): void {
    const appNotification: AppNotification = {
      id: notification.id || crypto.randomUUID(),
      title: notification.title || 'Notification',
      body: notification.body || '',
      type: (notification.data?.type as any) || 'admin_message',
      data: notification.data,
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([appNotification, ...currentNotifications]);
    this.updateUnreadCount();
    this.saveNotifications();

    this.toastService.info(notification.title || 'New notification');
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    const data = notification.notification.data;
    const type = data?.type;

    this.markAsRead(notification.notification.id);

    switch (type) {
      case 'work_order_assigned':
      case 'status_changed':
      case 'priority_update':
        if (data?.workOrderId) {
          this.router.navigate(['/work-orders', data.workOrderId]);
        } else {
          this.router.navigate(['/work-orders']);
        }
        break;
      case 'admin_message':
        this.router.navigate(['/notifications']);
        break;
      default:
        this.router.navigate(['/work-orders']);
    }
  }

  private showSoftPromptIfNeeded(): void {
    const prefs = this.getPreferences();
    const now = Date.now();

    if (prefs.showSoftPrompt) {
      return;
    }

    if (prefs.lastPermissionAsk > 0 && (now - prefs.lastPermissionAsk) < this.SOFT_PROMPT_DELAY_MS) {
      return;
    }

    this.updatePreferences({ showSoftPrompt: true });

    setTimeout(() => {
      this.toastService.info('You can enable notifications from Profile settings to receive work order updates', 6000);
    }, 2000);
  }

  private scheduleSoftPromptIfNeeded(): void {
  }

  async openSettings(): Promise<void> {
    const prefs = this.getPreferences();
    if (prefs.permissionState === 'denied_forever') {
      this.toastService.info('Please enable notifications in your device settings', 4000);
    }
  }

  getFCMToken(): string | null {
    const prefs = this.getPreferences();
    return prefs.fcmToken || localStorage.getItem('fcm_token');
  }

  getPermissionState(): NotificationPermissionState {
    return this.permissionStateSubject.value;
  }

  markAsRead(notificationId: string): void {
    const notifications = this.notificationsSubject.value.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  markAllAsRead(): void {
    const notifications = this.notificationsSubject.value.map(n => ({ ...n, read: true }));
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  deleteNotification(notificationId: string): void {
    const notifications = this.notificationsSubject.value.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(notifications);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  clearAll(): void {
    this.notificationsSubject.next([]);
    this.updateUnreadCount();
    this.saveNotifications();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  private saveNotifications(): void {
    const notifications = this.notificationsSubject.value;
    localStorage.setItem('app_notifications', JSON.stringify(notifications));
  }

  private loadNotifications(): void {
    try {
      const stored = localStorage.getItem('app_notifications');
      if (stored) {
        const notifications = JSON.parse(stored);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }

  async sendTestNotification(): Promise<void> {
    const testNotification: AppNotification = {
      id: crypto.randomUUID(),
      title: 'Test Notification',
      body: 'This is a test notification from Saazvat Field Service',
      type: 'admin_message',
      timestamp: new Date(),
      read: false
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([testNotification, ...currentNotifications]);
    this.updateUnreadCount();
    this.saveNotifications();

    this.toastService.success('Test notification sent!');
  }
}