import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'jwt_token';

  /**
   * Store JWT token as a cookie
   * @param token JWT token from backend
   */
  setToken(token: string): void {
    // Set cookie with 7 days expiration
    const expirationDays = 7;
    const date = new Date();
    date.setTime(date.getTime() + (expirationDays * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${this.TOKEN_KEY}=${token};${expires};path=/;SameSite=Strict`;
  }

  /**
   * Get JWT token from cookie
   * @returns JWT token or null if not found
   */
  getToken(): string | null {
    const name = this.TOKEN_KEY + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length, cookie.length);
      }
    }
    return null;
  }

  /**
   * Remove JWT token from cookie
   */
  clearToken(): void {
    document.cookie = `${this.TOKEN_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
  }

  /**
   * Decode JWT token payload
   * @param token JWT token to decode
   * @returns Decoded payload or null if invalid
   */
  private decodeToken(token: string): any {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }
      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      return JSON.parse(decoded);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   * @returns true if token is expired or invalid, false otherwise
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    // JWT exp is in seconds, Date.now() is in milliseconds
    const expirationDate = decoded.exp * 1000;
    const now = Date.now();
    
    return expirationDate < now;
  }

  /**
   * Check if user is authenticated
   * @returns true if token exists and is not expired, false otherwise
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }
    
    if (this.isTokenExpired()) {
      this.clearToken();
      return false;
    }
    
    return true;
  }
}
