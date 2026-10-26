import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';
import {
  AuthRequest,
  AuthResponse,
  DecodedToken,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RegisterRequest,
  UserResponse,
  UserRole
} from '../models';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TokenStorageService);
  private readonly baseUrl = environment.apiUrl;

  readonly currentUser = signal<UserResponse | null>(this.tokenStorage.getUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly isAdmin = computed(() => this.currentUser()?.role === 'ROLE_ADMIN');

  login(credentials: AuthRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth`, credentials).pipe(
      tap((res) => {
        this.tokenStorage.saveTokens(res.accessToken, res.refreshToken);
        this.initUserFromToken(res.accessToken, credentials.email);
      })
    );
  }

  register(data: RegisterRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/auth/register`, data);
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    const payload: RefreshTokenRequest = { refreshToken: refreshToken ?? '' };
    return this.http.post<RefreshTokenResponse>(`${this.baseUrl}/auth/refresh`, payload).pipe(
      tap((res) => {
        this.tokenStorage.saveAccessToken(res.accessToken);
      })
    );
  }

  logout(): void {
    this.tokenStorage.clear();
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  hasRole(role: UserRole): boolean {
    return this.currentUser()?.role === role;
  }

  setCurrentUser(user: UserResponse): void {
    this.tokenStorage.saveUser(user);
    this.currentUser.set(user);
  }

  private initUserFromToken(token: string, fallbackEmail: string): void {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      let role: UserRole = 'ROLE_USER';
      if (decoded.role === 'ROLE_ADMIN' || decoded.roles?.includes('ROLE_ADMIN')) {
        role = 'ROLE_ADMIN';
      }

      const user: UserResponse = {
        id: (decoded['id'] as number) || 0,
        nombre: (decoded['nombre'] as string) || decoded.sub || 'Usuario',
        email: decoded.sub || fallbackEmail,
        role,
        status: 'ACTIVE',
        inmobiliariaId: decoded.inmobiliariaId || 0,
        inmobiliariaNombre: (decoded['inmobiliariaNombre'] as string) || ''
      };

      this.setCurrentUser(user);
    } catch {
      this.logout();
    }
  }
}
