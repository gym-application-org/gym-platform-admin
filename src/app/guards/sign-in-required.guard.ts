import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';

/**
 * `/sign-in-required` is only for guests; signed-in users are sent to the app or unauthorized.
 */
export const signInRequiredGuestGuard: CanActivateFn = async () => {
  const auth = inject(AuthorizationService);
  const router = inject(Router);

  const authenticated = await auth.isAuthenticated();
  if (!authenticated) {
    return true;
  }

  if (await auth.isAdmin()) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/unauthorized']);
};
