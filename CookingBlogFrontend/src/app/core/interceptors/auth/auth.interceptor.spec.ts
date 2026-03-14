import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { AuthService } from "../../../shared/services/auth/auth.service";
import { AuthInterceptor } from "./auth.interceptor";
import { AlertService } from "../../../shared/services/alert/alert.service";
import { USER_MESSAGES } from "../../../shared/services/error/error.constants";
import { AUTH_ERROR_STRATEGY } from "../../http/auth-context";

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let alertServiceSpy: jasmine.SpyObj<AlertService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'logout'], { token: 'mock-token' });
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/' });
    alertServiceSpy = jasmine.createSpyObj('AlertService', ['emitInlineError']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AlertService, useValue: alertServiceSpy }
      ]
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should redirect and show default message on 401 if NO strategy is provided (default)', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    http.get('/api/data').subscribe({ error: () => { } });

    const req = httpMock.expectOne('/api/data');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/admin', 'login']);
    expect(alertServiceSpy.emitInlineError).toHaveBeenCalledWith(USER_MESSAGES.SESSION_EXPIRED);
  });

  it('should show silent message and NOT navigate on 401 if strategy is SILENT', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    
    const context = new HttpContext().set(AUTH_ERROR_STRATEGY, 'silent');

    http.get('/api/comments', { context }).subscribe({ error: () => { } });

    const req = httpMock.expectOne('/api/comments');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(alertServiceSpy.emitInlineError).toHaveBeenCalledWith(USER_MESSAGES.SESSION_EXPIRED_COMMENT);
  });

  it('should handle 403 Forbidden error', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);

    http.get('/api/forbidden').subscribe({
      error: (err) => expect(err.status).toBe(403)
    });

    const req = httpMock.expectOne('/api/forbidden');
    req.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(alertServiceSpy.emitInlineError).toHaveBeenCalledWith(USER_MESSAGES.ACCESS_DENIED);
  });
});
