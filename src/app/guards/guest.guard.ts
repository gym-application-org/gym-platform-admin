import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';

/**
 * For routes like `/login`: allow guests; send authenticated admins to the app shell;
 * send authenticated non-admins to `/unauthorized` (consistent with {@link AuthGuard}).
 */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(AuthorizationService);
  const router = inject(Router);

  const authenticated = await auth.isAuthenticated();
  if (!authenticated) {
    return true;
  }

  const isAdmin = await auth.isAdmin();
  if (isAdmin) {
    return router.createUrlTree(['/']);
  }

  return router.createUrlTree(['/unauthorized']);
};
