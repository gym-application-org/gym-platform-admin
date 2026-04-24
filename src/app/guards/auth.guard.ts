import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthorizationService } from '../services/authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthorizationService,
    private router: Router
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    try {
      const isAuthenticated = await this.authService.isAuthenticated();
      
      if (!isAuthenticated) {
        const hasToken = await this.authService.hasToken();
        if (hasToken) {
          return true;
        }
        this.router.navigate(['/sign-in-required'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }

      const requiredRoles = route.data['roles'] as string[];
      if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = await this.authService.hasAnyRole(requiredRoles);
        if (!hasRequiredRole) {
          this.router.navigate(['/unauthorized']);
          return false;
        }
      }

      return true;
    } catch {
      this.router.navigate(['/sign-in-required'], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }
}
