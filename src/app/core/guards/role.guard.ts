import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];
  const currentUser = authService.currentUserValue;

  if (currentUser && currentUser.role === expectedRole) {
    return true;
  }

  // If not authorized, redirect to login or an unauthorized page
  return router.createUrlTree(['/login']);
};
