import { ErrorHandler, Injectable, NgZone, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);
  private ngZone = inject(NgZone);
  private isAppStable = true;

  constructor() {
    this.ngZone.run(() => {
      this.ngZone.onStable.subscribe(() => {
        this.isAppStable = true;
      });
      this.ngZone.onUnstable.subscribe(() => {
        this.isAppStable = false;
      });
    });
  }

  handleError(error: any): void {
    console.error('Global error caught:', error);

    let errorMessage = 'An unexpected error occurred';

    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    if (error?.stack) {
      console.error('Error stack:', error.stack);
    }

    this.ngZone.run(() => {
      try {
        this.toastService.error(`Error: ${errorMessage}`);
      } catch (toastError) {
        console.error('Failed to show error toast:', toastError);
      }
    });

    if (!this.isAppStable) {
      setTimeout(() => {
        this.ngZone.run(() => {
          console.log('App has stabilized after error');
        });
      }, 100);
    }
  }
}
