import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services';
import { UserRole } from '../models';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const expectedRole = route.data?.['role'] as UserRole | undefined;
  const expectedRoles = route.data?.['roles'] as UserRole[] | undefined;

  if (expectedRole && authService.hasRole(expectedRole)) {
    return true;
  }

  if (expectedRoles && expectedRoles.some((r) => authService.hasRole(r))) {
    return true;
  }

  return router.createUrlTree(['/']);
};
