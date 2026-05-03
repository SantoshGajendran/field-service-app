import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container fade-in">
      <div class="header">
        <h1 class="page-title neon-text-primary">Profile</h1>
        <p class="subtitle">Technician information and settings</p>
      </div>

      <div class="settings-card glass-panel">
        <div class="setting-row">
          <div class="setting-info">
            <div class="setting-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </div>
            <div class="setting-text">
              <h3>Theme</h3>
              <p>Switch between light and dark mode</p>
            </div>
          </div>
          <button
            class="theme-toggle"
            [class.active]="(themeService.theme$ | async) === 'dark'"
            (click)="themeService.toggleTheme()"
            aria-label="Toggle theme">
            <span class="toggle-track">
              <span class="toggle-thumb"></span>
            </span>
            <span class="toggle-label">{{ (themeService.theme$ | async) === 'dark' ? 'Dark' : 'Light' }}</span>
          </button>
        </div>
      </div>

      <div class="profile-card glass-panel">
        <div class="avatar-section">
          <div class="avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="status-badge">
            <span class="status-dot"></span>
            Active
          </div>
        </div>

        <div class="profile-info" *ngIf="currentUser">
          <h2>{{ currentUser.name }}</h2>
          <p class="role">{{ currentUser.role }}</p>
          <p class="id">ID: {{ currentUser.id }}</p>
          <p class="email" *ngIf="currentUser.email">{{ currentUser.email }}</p>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card glass-panel">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">24</span>
            <span class="stat-label">Completed</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">3</span>
            <span class="stat-label">In Progress</span>
          </div>
        </div>

        <div class="stat-card glass-panel">
          <div class="stat-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-value">98%</span>
            <span class="stat-label">Success Rate</span>
          </div>
        </div>
      </div>

      <div class="coming-soon glass-panel">
        <div class="icon-wrapper">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
        </div>
        <h3>More Features Coming Soon</h3>
        <p>Additional profile features are under development.</p>
        <div class="features-list">
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Skills & certifications</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Work history</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Performance metrics</span>
          </div>
          <div class="feature-item">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>Settings & preferences</span>
          </div>
        </div>
      </div>

      <button class="logout-button interactive" (click)="onLogout()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
          <polyline points="16 17 21 12 16 7"></polyline>
          <line x1="21" y1="12" x2="9" y2="12"></line>
        </svg>
        Sign Out
      </button>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .header {
      margin-bottom: 4px;
    }

    .page-title {
      font-size: 1.75rem;
      margin: 0 0 4px 0;
      font-weight: 700;
    }

    .subtitle {
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .settings-card {
      padding: 24px;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }

    .setting-info {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
    }

    .setting-icon {
      width: 48px;
      height: 48px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 24px;
        height: 24px;
        color: var(--color-accent-primary);
      }
    }

    .setting-text {
      h3 {
        font-size: 1.1rem;
        margin: 0 0 4px 0;
        color: var(--color-text-primary);
        font-weight: 600;
      }

      p {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .theme-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius-md);
      transition: all var(--transition-base);

      &:hover {
        background: var(--glass-bg-lighter);
      }

      &:active {
        transform: scale(0.95);
      }
    }

    .toggle-track {
      position: relative;
      width: 56px;
      height: 28px;
      background: var(--glass-bg-light);
      border: 2px solid var(--glass-border);
      border-radius: var(--radius-full);
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      padding: 2px;
    }

    .toggle-thumb {
      width: 20px;
      height: 20px;
      background: var(--color-text-secondary);
      border-radius: 50%;
      transition: all var(--transition-base);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .theme-toggle.active .toggle-track {
      background: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
      box-shadow: var(--neon-primary);
    }

    .theme-toggle.active .toggle-thumb {
      background: white;
      transform: translateX(28px);
      box-shadow: 0 2px 8px rgba(14, 165, 233, 0.4);
    }

    .toggle-label {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-text-primary);
      min-width: 45px;
    }

    .profile-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 24px;
      gap: 20px;
    }

    .avatar-section {
      position: relative;
    }

    .avatar {
      width: 120px;
      height: 120px;
      background: var(--gradient-primary);
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      border: 4px solid var(--glass-border);
      box-shadow: 0 0 40px rgba(14, 165, 233, 0.4);

      svg {
        width: 60px;
        height: 60px;
        color: white;
      }
    }

    .status-badge {
      position: absolute;
      bottom: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--color-status-success);
      backdrop-filter: var(--glass-blur);

      .status-dot {
        width: 8px;
        height: 8px;
        background: var(--color-status-success);
        border-radius: 50%;
        animation: pulse 2s ease-in-out infinite;
        box-shadow: 0 0 10px var(--color-status-success);
      }
    }

    .profile-info {
      text-align: center;

      h2 {
        font-size: 1.5rem;
        margin: 0 0 4px 0;
        color: var(--color-text-primary);
        font-weight: 700;
      }

      .role {
        font-size: 1rem;
        color: var(--color-text-secondary);
        margin: 0 0 8px 0;
      }

      .id {
        font-size: 0.85rem;
        color: var(--color-text-tertiary);
        font-family: var(--font-mono);
        margin: 0 0 4px 0;
      }

      .email {
        font-size: 0.85rem;
        color: var(--color-text-secondary);
        margin: 0;
      }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      transition: all var(--transition-base);

      &:hover {
        transform: translateY(-4px);
      }
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;

      svg {
        width: 24px;
        height: 24px;
        color: var(--color-accent-primary);
      }
    }

    .stat-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--color-text-primary);
      line-height: 1;
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    .coming-soon {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px 24px;
      text-align: center;
    }

    .icon-wrapper {
      width: 80px;
      height: 80px;
      margin-bottom: 20px;
      padding: 20px;
      background: var(--glass-bg-light);
      border-radius: var(--radius-full);
      border: 2px solid var(--glass-border);
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 100%;
        height: 100%;
        color: var(--color-accent-secondary);
        filter: drop-shadow(0 0 12px rgba(245, 158, 11, 0.5));
      }
    }

    h3 {
      color: var(--color-text-primary);
      margin-bottom: 8px;
      font-size: 1.5rem;
      font-weight: 700;
    }

    p {
      font-size: 1rem;
      color: var(--color-text-secondary);
      max-width: 400px;
      margin-bottom: 24px;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      width: 100%;
      max-width: 600px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--glass-bg-light);
      border: 1px solid var(--glass-border);
      border-radius: var(--radius-md);
      transition: all var(--transition-base);
      text-align: left;

      svg {
        color: var(--color-status-success);
        flex-shrink: 0;
      }

      span {
        color: var(--color-text-primary);
        font-weight: 500;
        font-size: 0.9rem;
      }

      &:hover {
        border-color: var(--glass-border-light);
        transform: translateX(4px);
      }
    }

    .logout-button {
      width: 100%;
      padding: 16px;
      background: var(--glass-bg-light);
      border: 2px solid var(--color-status-error);
      border-radius: var(--radius-md);
      color: var(--color-status-error);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--transition-base);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-top: 8px;

      svg {
        width: 20px;
        height: 20px;
      }

      &:hover {
        background: var(--color-status-error);
        color: white;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      }

      &:active {
        transform: translateY(0);
      }
    }
  `]
})
export class ProfileComponent {
  themeService = inject(ThemeService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentUser = this.authService.getCurrentUser();

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
