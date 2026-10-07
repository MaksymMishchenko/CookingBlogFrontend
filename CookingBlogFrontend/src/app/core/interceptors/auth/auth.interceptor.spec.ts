import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpContext, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AUTH_REDIRECT } from '../../http/auth-context';
import { AuthInterceptor } from './auth.interceptor';

@Component({ standalone: true, template: '' })
class StubComponent { }

class FakeAuthService {
  loggedIn = true;
  token = 'test-token';
  isAuthenticated = () => this.loggedIn;
  logout = () => { this.loggedIn = false; };
}

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let backend: HttpTestingController;
  let router: Router;
  let auth: FakeAuthService;

  const unauthorized = (context?: HttpContext) => {
    http.get('/api/test', { context }).subscribe({ error: () => { } });
    backend.expectOne('/api/test').flush('', { status: 401, statusText: 'Unauthorized' });
  };

  const returnUrl = () => router.parseUrl(router.url).queryParams['returnUrl'];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([AuthInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'admin/dashboard', component: StubComponent },
          { path: 'admin/posts/edit/:id', component: StubComponent },
          { path: 'admin/login', component: StubComponent },
          { path: 'posts/:slug', component: StubComponent },
        ]),
        { provide: AuthService, useClass: FakeAuthService },
      ],
    });

    http = TestBed.inject(HttpClient);
    backend = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService) as unknown as FakeAuthService;
  });

  afterEach(() => backend.verify());

  it('sends the token with requests', () => {
    // Arrange

    // Act
    http.get('/api/test').subscribe();
    const req = backend.expectOne('/api/test');

    // Assert
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
  });

  it('on 401 logs out and sends the user to login, remembering the page they were on', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/admin/posts/edit/42?tab=seo');

    // Act
    unauthorized();
    await harness.fixture.whenStable();

    // Assert
    expect(auth.isAuthenticated()).toBeFalse();
    expect(router.url).toContain('/admin/login');
    expect(returnUrl()).toBe('/admin/posts/edit/42?tab=seo');
  });

  it('on 401 with AUTH_REDIRECT=false (comments) logs out but keeps the user on the page', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/posts/my-slug');

    // Act
    unauthorized(new HttpContext().set(AUTH_REDIRECT, false));
    await harness.fixture.whenStable();

    // Assert
    expect(auth.isAuthenticated()).toBeFalse();
    expect(router.url).toBe('/posts/my-slug');
  });

  it('on 401 while already on login stays there without nesting returnUrl', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/admin/login');

    // Act
    unauthorized();
    await harness.fixture.whenStable();

    // Assert
    expect(router.url).toBe('/admin/login');
  });

  it('does not touch the session on other errors', async () => {
    // Arrange
    const harness = await RouterTestingHarness.create('/admin/dashboard');

    // Act
    http.get('/api/test').subscribe({ error: () => { } });
    backend.expectOne('/api/test').flush('', { status: 500, statusText: 'Server Error' });
    await harness.fixture.whenStable();

    // Assert
    expect(auth.isAuthenticated()).toBeTrue();
    expect(router.url).toBe('/admin/dashboard');
  });
});