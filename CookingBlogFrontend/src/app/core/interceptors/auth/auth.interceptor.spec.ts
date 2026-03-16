import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AlertService } from '../../../shared/services/alert/alert.service';
import { AUTH_REDIRECT } from '../../http/auth-context';
import { USER_MESSAGES } from '../../../shared/services/error/error.constants';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let httpClient: HttpClient;
  let httpTestingController: HttpTestingController;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let alertServiceMock: jasmine.SpyObj<AlertService>;
  let routerMock: any;

  beforeEach(() => {
    const authSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout']);
    
    Object.defineProperty(authSpy, 'token', {
      get: () => 'test-token'
    });
    
    const alertSpy = jasmine.createSpyObj('AlertService', ['emitInlineError', 'warning']);
    
    routerMock = {
      navigate: jasmine.createSpy('navigate'),
      url: '/admin/dashboard'
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authSpy },
        { provide: AlertService, useValue: alertSpy },
        { provide: Router, useValue: routerMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpTestingController = TestBed.inject(HttpTestingController);
    authServiceMock = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    alertServiceMock = TestBed.inject(AlertService) as jasmine.SpyObj<AlertService>;
    
    authServiceMock.isAuthenticated.and.returnValue(true);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('401 Unauthorized error', () => {
    it('should redirect to login when AUTH_REDIRECT is true and not on login page', fakeAsync(() => {
      routerMock.url = '/admin/dashboard';
      
      let errorReceived: any;
      
      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, true)
      }).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (err) => { errorReceived = err; }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(errorReceived.status).toBe(401);
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).toHaveBeenCalledWith(['/admin', 'login']);
      expect(alertServiceMock.emitInlineError).toHaveBeenCalledWith(USER_MESSAGES.SESSION_EXPIRED);
    }));

    it('should NOT redirect when AUTH_REDIRECT is false', fakeAsync(() => {
      routerMock.url = '/admin/dashboard';
      
      let errorReceived: any;
      
      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, false)
      }).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (err) => { errorReceived = err; }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(errorReceived.status).toBe(401);
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(alertServiceMock.emitInlineError).not.toHaveBeenCalled();
    }));

    it('should NOT redirect when already on login page even if AUTH_REDIRECT is true', fakeAsync(() => {
      routerMock.url = '/admin/login';
      
      let errorReceived: any;
      
      httpClient.get('/api/test', {
        context: new HttpContext().set(AUTH_REDIRECT, true)
      }).subscribe({
        next: () => fail('should have failed with 401 error'),
        error: (err) => { errorReceived = err; }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
      tick();

      expect(errorReceived.status).toBe(401);
      expect(authServiceMock.logout).toHaveBeenCalled();
      expect(routerMock.navigate).not.toHaveBeenCalled();
      expect(alertServiceMock.emitInlineError).not.toHaveBeenCalled();
    }));
  });

  describe('403 Forbidden error', () => {
    it('should show warning message', fakeAsync(() => {
      routerMock.url = '/admin/dashboard';
      
      let errorReceived: any;
      
      httpClient.get('/api/test').subscribe({
        next: () => fail('should have failed with 403 error'),
        error: (err) => { errorReceived = err; }
      });

      const req = httpTestingController.expectOne('/api/test');
      req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
      tick();

      expect(errorReceived.status).toBe(403);
      expect(authServiceMock.logout).not.toHaveBeenCalled();
      expect(alertServiceMock.warning).toHaveBeenCalledWith(USER_MESSAGES.ACCESS_DENIED);
      expect(routerMock.navigate).not.toHaveBeenCalled();
    }));
  });
});