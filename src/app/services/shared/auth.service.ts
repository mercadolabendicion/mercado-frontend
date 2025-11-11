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
   * Check if user is authenticated
   * @returns true if token exists, false otherwise
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}
