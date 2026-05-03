import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginCredentials } from '../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-background"></div>

      <div class="login-card glass-panel fade-in">
        <div class="logo-section">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
              <path d="M2 17l10 5 10-5"></path>
              <path d="M2 12l10 5 10-5"></path>
            </svg>
          </div>
          <h1 class="app-title neon-text-primary">Field Service</h1>
          <p class="app-subtitle">Saazvat Solutions</p>
        </div>

        <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              <input
                type="text"
                id="username"
                name="username"
                [(ngModel)]="credentials.username"
                required
                placeholder="Enter your username"
                [disabled]="isLoading"
                autocomplete="username">
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              <input
                type="password"
                id="password"
                name="password"
                [(ngModel)]="credentials.password"
                required
                placeholder="Enter your password"
                [disabled]="isLoading"
                autocomplete="current-password">
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="login-button interactive"
            [disabled]="!loginForm.valid || isLoading">
            <span *ngIf="!isLoading">Sign In</span>
            <span *ngIf="isLoading" class="loading-spinner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83"></path>
              </svg>
              Signing in...
            </span>
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }

    .login-background {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background:
        radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
        radial-gradient(circle at 40% 20%, rgba(245, 158, 11, 0.1) 0%, transparent 50%);
      animation: backgroundPulse 15s ease-in-out infinite;
      pointer-events: none;
      z-index: 0;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 40px 32px;
      position: relative;
      z-index: 1;
    }

    .logo-section {
      text-align: center;
      margin-bottom: 32px;
    }

    .logo-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 16px;
      background: var(--gradient-primary);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: var(--neon-primary);
      animation: pulse 3s ease-in-out infinite;

      svg {
        width: 40px;
        height: 40px;
        color: white;
      }
    }

    .app-title {
      font-size: 2rem;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .app-subtitle {
      font-size: 0.95rem;
      color: var(--color-text-secondary);
      margin: 0;
      font-weight: 500;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;

      label {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--color-text-primary);
      }
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 14px;
      width: 20px;
      height: 20px;
      color: var(--color-text-tertiary);
      pointer-events: none;
      z-index: 1;
    }

    input {
      width: 100%;
      padding: 14px 14px 14px 44px;
      background: var(--glass-bg-light);
      border: 2px solid var(--glass-border);
      border-radius: var(--radius-md);
      color: var(--color-text-primary);
      font-size: 0.95rem;
      transition: all var(--transition-base);
      font-family: var(--font-family);

      &::placeholder {
        color: var(--color-text-tertiary);
      }

      &:focus {
        outline: none;
        border-color: var(--color-accent-primary);
        box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        background: var(--glass-bg);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid var(--color-status-error);
      border-radius: var(--radius-md);
      color: var(--color-status-error);
      font-size: 0.9rem;
      animation: slideDown 0.3s ease-out;

      svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }

    .login-button {
      width: 100%;
      padding: 16px;
      background: var(--gradient-primary);
      border: none;
      border-radius: var(--radius-md);
      color: white;
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
      box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
      margin-top: 8px;

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: var(--neon-primary);
      }

      &:active:not(:disabled) {
        transform: translateY(0);
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;

      svg {
        width: 20px;
        height: 20px;
        animation: spin 1s linear infinite;
      }
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  credentials: LoginCredentials = {
    username: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.credentials).subscribe({
      next: (authState) => {
        this.isLoading = false;

        // Redirect based on user role
        if (authState.user?.role === 'Administrator') {
          // Admin goes to admin dashboard
          this.router.navigate(['/admin']);
        } else {
          // Regular users go to work orders or return URL
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/work-orders';
          this.router.navigate([returnUrl]);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }
}
