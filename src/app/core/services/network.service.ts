import { Injectable, NgZone } from '@angular/core';
import { Network, ConnectionStatus } from '@capacitor/network';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private networkStatusSubject = new BehaviorSubject<boolean>(true);
  public isOnline$: Observable<boolean> = this.networkStatusSubject.asObservable();

  constructor(private ngZone: NgZone) {
    this.initNetworkMonitoring();
  }

  private async initNetworkMonitoring() {
    // Initial status check
    const status = await Network.getStatus();
    this.updateStatus(status.connected);

    // Listen for network changes via Capacitor
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      this.ngZone.run(() => {
        this.updateStatus(status.connected);
      });
    });

    // Browser fallbacks
    window.addEventListener('online', () => {
      this.ngZone.run(() => {
        this.updateStatus(true);
      });
    });

    window.addEventListener('offline', () => {
      this.ngZone.run(() => {
        this.updateStatus(false);
      });
    });
  }

  private updateStatus(isOnline: boolean) {
    if (this.networkStatusSubject.getValue() !== isOnline) {
      this.networkStatusSubject.next(isOnline);
    }
  }

  public get currentStatus(): boolean {
    return this.networkStatusSubject.getValue();
  }
}
