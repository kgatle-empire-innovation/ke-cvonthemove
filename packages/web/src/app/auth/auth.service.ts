import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { User } from '@cvonthemove/db';
import { BaseService } from '../common/base/BaseService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthPayload {
  user: Partial<User>;
  token: string;
}

const TOKEN_KEY = 'cvotm_token';
const USER_KEY  = 'cvotm_user';

@Injectable({ providedIn: 'root' })
export class AuthService extends BaseService {
  private _currentUser$ = new BehaviorSubject<Partial<User> | null>(
    this.loadStoredUser()
  );

  /** Emits the authenticated user, or null when logged out. */
  public readonly currentUser$ = this._currentUser$.asObservable();

  constructor(private http: HttpClient) {
    super();
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public register(email: string, password: string, name?: string): Observable<ApiResponse<AuthPayload>> {
    this.apiUrl = '/api/auth/register';
    return this.http.post<ApiResponse<AuthPayload>>(this.apiUrl, { email, password, name }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  public login(email: string, password: string): Observable<ApiResponse<AuthPayload>> {
    this.apiUrl = '/api/auth/login';
    return this.http.post<ApiResponse<AuthPayload>>(this.apiUrl, { email, password }).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  /**
   * Promotes an anonymous wizard session to the authenticated account.
   * Called automatically after login/register when a wizard session exists.
   */
  public promoteSession(sessionId: string): Observable<ApiResponse<null>> {
    this.apiUrl = '/api/auth/promote-session';
    return this.http.post<ApiResponse<null>>(this.apiUrl, { sessionId });
  }

  public logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this._currentUser$.next(null);
  }

  private handleAuthResponse(res: ApiResponse<AuthPayload>): void {
    if (res.success && res.data) {
      localStorage.setItem(TOKEN_KEY, res.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.data.user));
      this._currentUser$.next(res.data.user);
    }
  }

  private loadStoredUser(): Partial<User> | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
