import { Injectable } from '@angular/core';
import { UserResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  private readonly ACCESS_TOKEN_KEY = 'inmo_access_token';
  private readonly REFRESH_TOKEN_KEY = 'inmo_refresh_token';
  private readonly USER_KEY = 'inmo_user_profile';

  getAccessToken(): string | null {
    return localStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  saveAccessToken(token: string): void {
    localStorage.setItem(this.ACCESS_TOKEN_KEY, token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  saveRefreshToken(token: string): void {
    localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
  }

  saveTokens(accessToken: string, refreshToken: string): void {
    this.saveAccessToken(accessToken);
    this.saveRefreshToken(refreshToken);
  }

  getUser(): UserResponse | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserResponse;
    } catch {
      return null;
    }
  }

  saveUser(user: UserResponse): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  clear(): void {
    localStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }
}
