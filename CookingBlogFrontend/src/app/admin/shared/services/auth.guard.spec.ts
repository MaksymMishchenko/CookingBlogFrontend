import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AUTH_ROLES } from '../../../core/constants/auth.constants';

class FakeAuthService {
  loggedIn = true;
  role: string | null = AUTH_ROLES.ADMIN;
  isAuthenticated = () => this.loggedIn;
  getUserRole = () => this.role;
  logout = () => { this.loggedIn = false; };
}

describe('authGuard', () => {
  let router: Router;
  let auth: FakeAuthService;

  const runGuard = (url = '/admin/dashboard') =>
    TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    );

  const redirect = (result: unknown) => {
    const tree = result as UrlTree;
    return {
      path: router.serializeUrl(tree).split('?')[0],
      query: tree.queryParams,
    };
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useClass: FakeAuthService },
      ],
    });
    router = TestBed.inject(Router);
    auth = TestBed.inject(AuthService) as unknown as FakeAuthService;
  });

  it('lets an admin in', () => {
    // Arrange
    auth.role = AUTH_ROLES.ADMIN;

    // Act
    const result = runGuard();

    // Assert
    expect(result).toBeTrue();
  });

  it('lets a contributor in', () => {
    // Arrange
    auth.role = AUTH_ROLES.CONTRIBUTOR;

    // Act
    const result = runGuard();

    // Assert
    expect(result).toBeTrue();
  });

  it('sends a logged-out user to login and remembers the requested page', () => {
    // Arrange
    auth.loggedIn = false;

    // Act
    const { path, query } = redirect(runGuard('/admin/dashboard?page=2&status=draft'));

    // Assert
    expect(path).toBe('/admin/login');
    expect(query).toEqual({ returnUrl: '/admin/dashboard?page=2&status=draft' });
  });

  it('sends a regular user to login with accessDenied and no returnUrl', () => {
    // Arrange
    auth.role = 'User';

    // Act
    const { path, query } = redirect(runGuard('/admin/dashboard'));

    // Assert
    expect(path).toBe('/admin/login');
    expect(query).toEqual({ accessDenied: 'true' });
  });
});