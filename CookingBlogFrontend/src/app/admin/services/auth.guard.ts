import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../../shared/services/auth/auth.service';
import { AlertService } from '../../shared/services/alert/alert.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const alertService = inject(AlertService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  authService.logout(); 
  return router.createUrlTree(['/admin', 'login']);
};