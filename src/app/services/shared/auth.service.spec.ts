import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  // Helper function to create a JWT token with custom expiration
  const createMockToken = (expiresInSeconds: number): string => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const expirationTime = Math.floor(Date.now() / 1000) + expiresInSeconds;
    const payload = btoa(JSON.stringify({ 
      sub: '1234567890', 
      name: 'Test User',
      exp: expirationTime 
    }));
    const signature = 'fake-signature';
    return `${header}.${payload}.${signature}`;
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    // Clear cookies before each test
    document.cookie = 'jwt_token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and get token from cookie', () => {
    const testToken = 'test-jwt-token-12345';
    service.setToken(testToken);
    const retrievedToken = service.getToken();
    expect(retrievedToken).toBe(testToken);
  });

  it('should return null when no token is set', () => {
    const token = service.getToken();
    expect(token).toBeNull();
  });

  it('should clear token', () => {
    const testToken = 'test-jwt-token-12345';
    service.setToken(testToken);
    expect(service.getToken()).toBe(testToken);
    
    service.clearToken();
    expect(service.getToken()).toBeNull();
  });

  it('should return true for isAuthenticated when valid token exists', () => {
    const validToken = createMockToken(3600); // Token expires in 1 hour
    service.setToken(validToken);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false for isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should return false for isAuthenticated when token is expired', () => {
    const expiredToken = createMockToken(-3600); // Token expired 1 hour ago
    service.setToken(expiredToken);
    expect(service.isAuthenticated()).toBe(false);
  });

  it('should clear token when checking authentication with expired token', () => {
    const expiredToken = createMockToken(-3600); // Token expired 1 hour ago
    service.setToken(expiredToken);
    service.isAuthenticated();
    expect(service.getToken()).toBeNull();
  });

  it('should return true for isTokenExpired when token is expired', () => {
    const expiredToken = createMockToken(-3600); // Token expired 1 hour ago
    service.setToken(expiredToken);
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return false for isTokenExpired when token is valid', () => {
    const validToken = createMockToken(3600); // Token expires in 1 hour
    service.setToken(validToken);
    expect(service.isTokenExpired()).toBe(false);
  });

  it('should return true for isTokenExpired when no token exists', () => {
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return true for isTokenExpired when token is invalid', () => {
    service.setToken('invalid-token');
    expect(service.isTokenExpired()).toBe(true);
  });
});
