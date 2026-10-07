import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../../shared/services/auth/auth.service';
import { AUTH_ROLES } from '../../../core/constants/auth.constants';
import { ADMIN_ROUTER_PATHS } from '../../../core/constants/api-endpoints';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);


  if (!authService.isAuthenticated()) {
    authService.logout();
    return router.createUrlTree(
      [`/${ADMIN_ROUTER_PATHS.ADMIN}`, ADMIN_ROUTER_PATHS.LOGIN],
      { queryParams: { returnUrl: state.url } }
    );
  }

  const role = authService.getUserRole();

  if (role !== AUTH_ROLES.ADMIN && role !== AUTH_ROLES.CONTRIBUTOR) {
    return router.createUrlTree(
      [`/${ADMIN_ROUTER_PATHS.ADMIN}`, ADMIN_ROUTER_PATHS.LOGIN],
      { queryParams: { accessDenied: true } }
    );
  }

  return true;
};