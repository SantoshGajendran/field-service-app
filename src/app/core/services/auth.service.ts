import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError, from } from 'rxjs';
import { delay, tap, map, catchError } from 'rxjs/operators';
import { User, LoginCredentials, AuthState } from '../models/user.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly AUTH_KEY = 'auth-state';
  private authStateSubject = new BehaviorSubject<AuthState>(this.getInitialAuthState());

  public authState$ = this.authStateSubject.asObservable();
  public isAuthenticated$ = new Observable<boolean>(observer => {
    this.authState$.subscribe(state => observer.next(state.isAuthenticated));
  });

  constructor(private supabase: SupabaseService) {
    // Listen to Supabase auth changes
    this.supabase.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserProfile(user.id);
      }
      // Don't call logout here - it causes issues on initialization
    });
  }

  private getInitialAuthState(): AuthState {
    const savedAuth = localStorage.getItem(this.AUTH_KEY);
    if (savedAuth) {
      try {
        return JSON.parse(savedAuth);
      } catch {
        return { user: null, token: null, isAuthenticated: false };
      }
    }
    return { user: null, token: null, isAuthenticated: false };
  }

  private saveAuthState(state: AuthState): void {
    localStorage.setItem(this.AUTH_KEY, JSON.stringify(state));
    this.authStateSubject.next(state);
  }

  private async loadUserProfile(userId: string): Promise<void> {
    try {
      const profile = await this.supabase.getProfile(userId);
      const authState: AuthState = {
        user: {
          id: profile.id,
          username: profile.username,
          name: profile.full_name,
          role: profile.role,
          email: profile.email
        },
        token: 'supabase-session',
        isAuthenticated: true
      };
      this.saveAuthState(authState);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  // Real Supabase login
  login(credentials: LoginCredentials): Observable<AuthState> {
    return from(
      this.supabase.signIn(credentials.username, credentials.password)
        .then(async ({ user, session }) => {
          if (!user || !session) {
            throw new Error('Invalid login response');
          }
          // Load profile before returning
          const profile = await this.supabase.getProfile(user.id);
          const authState: AuthState = {
            user: {
              id: profile.id,
              username: profile.username,
              name: profile.full_name,
              role: profile.role,
              email: profile.email
            },
            token: session.access_token,
            isAuthenticated: true
          };
          this.saveAuthState(authState);
          return authState;
        })
    ).pipe(
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => new Error('Invalid username or password'));
      })
    );
  }

  logout(): void {
    const emptyState: AuthState = {
      user: null,
      token: null,
      isAuthenticated: false
    };
    this.saveAuthState(emptyState);
    // Don't call supabase.signOut() here to avoid circular issues
  }

  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  getToken(): string | null {
    return this.authStateSubject.value.token;
  }
}
