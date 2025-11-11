import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

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

  it('should return true for isAuthenticated when token exists', () => {
    const testToken = 'test-jwt-token-12345';
    service.setToken(testToken);
    expect(service.isAuthenticated()).toBe(true);
  });

  it('should return false for isAuthenticated when no token exists', () => {
    expect(service.isAuthenticated()).toBe(false);
  });
});
