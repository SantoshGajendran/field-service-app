import { ErrorHandler, Injectable, inject } from '@angular/core';
import { ToastService } from './toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private toastService = inject(ToastService);

  handleError(error: any): void {
    // Log the error to console for debugging
    console.error('Global error caught:', error);

    // Extract meaningful error message
    let errorMessage = 'An unexpected error occurred';

    if (error?.message) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }

    // Show user-friendly error message
    this.toastService.error(`Error: ${errorMessage}`);

    // Prevent the error from crashing the app
    // The error is logged but the app continues running
  }
}
