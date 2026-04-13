import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AUTH_ROLES } from '../../../core/constants/auth.constants';

describe('authGuard', () => {
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {    
    authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated', 'getUserRole', 'logout']);
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });
 
  it('should logout and redirect to login if NOT authenticated', () => {
    authServiceSpy.isAuthenticated.and.returnValue(false);
    const mockUrlTree = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTree);

    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    expect(authServiceSpy.logout).toHaveBeenCalled();
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/admin', 'login']);
    expect(result).toBe(mockUrlTree);
  });
 
  it('should redirect to login with queryParams if authenticated but NOT an Admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue('Contributor');
    
    const mockUrlTreeWithParams = {} as UrlTree;
    routerSpy.createUrlTree.and.returnValue(mockUrlTreeWithParams);

    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['/admin', 'login'], {
      queryParams: { accessDenied: true }
    });
    expect(result).toBe(mockUrlTreeWithParams);
  });
  
  it('should return true if authenticated and is an Admin', () => {
    authServiceSpy.isAuthenticated.and.returnValue(true);
    authServiceSpy.getUserRole.and.returnValue(AUTH_ROLES.ADMIN);

    const result = TestBed.runInInjectionContext(() => 
      authGuard({} as any, {} as any)
    );

    expect(result).toBeTrue();
  });
});