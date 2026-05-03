import { Injectable } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
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

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  private fcmToken: string | null = null;

  constructor(
    private router: Router,
    private toastService: ToastService
  ) {
    this.loadNotifications();
  }

  async initialize(): Promise<void> {
    // Only initialize on native platforms (Android/iOS)
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications not available on web platform');
      return;
    }

    // Request permission
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive === 'granted') {
      // Register with FCM
      await PushNotifications.register();

      // Listen for registration
      PushNotifications.addListener('registration', (token: Token) => {
        console.log('Push registration success, token: ' + token.value);
        this.fcmToken = token.value;
        this.saveFCMToken(token.value);
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error: any) => {
        console.error('Error on registration: ' + JSON.stringify(error));
      });

      // Listen for push notifications received
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('Push notification received: ', notification);
        this.handleNotificationReceived(notification);
      });

      // Listen for notification actions (user tapped notification)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
        console.log('Push notification action performed', notification);
        this.handleNotificationAction(notification);
      });
    } else {
      console.warn('Push notification permission not granted');
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

    // Add to notifications list
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([appNotification, ...currentNotifications]);
    this.updateUnreadCount();
    this.saveNotifications();

    // Show toast
    this.toastService.info(notification.title || 'New notification');
  }

  private handleNotificationAction(notification: ActionPerformed): void {
    const data = notification.notification.data;
    const type = data?.type;

    // Mark as read
    this.markAsRead(notification.notification.id);

    // Navigate based on notification type
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

  private async saveFCMToken(token: string): Promise<void> {
    // Store token in localStorage
    localStorage.setItem('fcm_token', token);

    // TODO: Send token to Supabase to store in user profile
    // This will be implemented in the Supabase integration task
    console.log('FCM Token saved:', token);
  }

  getFCMToken(): string | null {
    return this.fcmToken || localStorage.getItem('fcm_token');
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
    const stored = localStorage.getItem('app_notifications');
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      } catch (error) {
        console.error('Error loading notifications:', error);
      }
    }
  }

  // Test notification (for development)
  async sendTestNotification(): Promise<void> {
    const testNotification: AppNotification = {
      id: crypto.randomUUID(),
      title: 'Test Notification',
      body: 'This is a test notification',
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
