import { Injectable } from '@angular/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root'
})
export class HapticService {
  private isAvailable = Capacitor.isNativePlatform();

  async light() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async medium() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async heavy() {
    if (!this.isAvailable) return;
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async success() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async warning() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Warning });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async error() {
    if (!this.isAvailable) return;
    try {
      await Haptics.notification({ type: NotificationType.Error });
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }

  async selectionChanged() {
    if (!this.isAvailable) return;
    try {
      await Haptics.selectionStart();
      setTimeout(() => Haptics.selectionEnd(), 100);
    } catch (error) {
      console.warn('Haptic feedback not available:', error);
    }
  }
}
