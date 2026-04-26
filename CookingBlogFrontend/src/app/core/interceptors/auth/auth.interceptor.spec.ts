import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AUTH_REDIRECT } from '../../http/auth-context';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']);
    Object.defineProperty(authSpy, 'token', { get: () => 'test-token' });

    const routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/admin/dashboard' });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authServiceMock = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    routerMock = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should add an Authorization header when user is authenticated', () => {
    // Arrange
    authServiceMock.isAuthenticated.and.returnValue(true);

    // Act
    httpClient.get('/api/test').subscribe();
    const req = httpTestingController.expectOne('/api/test');

    // Assert
    expect(req.request.headers.has('Authorization')).toBeTrue();
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
  });

  describe('401 Unauthorized handling', () => {

    it('should logout and redirect when AUTH_REDIRECT is true and NOT on login page', () => {
      // Arrange
      (Object.getOwnPropertyDescriptor(routerMock, 'url')?.get as jasmine.Spy).and.returnValue('/admin/dashboard');

      // Act
      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, true)
      }).subscribe({
        error: (err) => expect(err.status).toBe(401)
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Assert
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin', 'login']);
    });

    it('should logout but NOT redirect when AUTH_REDIRECT is false', () => {
      // Arrange
      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, false)
      }).subscribe({
        error: (err) => expect(err.status).toBe(401)
      });

      // Act
      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Assert
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });

    it('should logout but NOT redirect when already on login page', () => {
      // Arrange    
      (Object.getOwnPropertyDescriptor(routerMock, 'url')?.get as jasmine.Spy).and.returnValue('/admin/login');

      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, true)
      }).subscribe({
        error: (err) => expect(err.status).toBe(401)
      });

      // Act
      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

      // Assert
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
    });
  });
});