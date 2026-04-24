import { Injectable, Inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthRepository } from '../data/repository/auth/auth-repository';
import { AUTH_REPOSITORY } from '../config/repository.tokens';

@Injectable()
export class TokenExpirationInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private router: Router,
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!request.withCredentials) {
      request = request.clone({
        withCredentials: true
      });
    }
    
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (request.url.includes('/api/auth/refreshtoken')) {
          return throwError(() => error);
        }

        if (error.status === 401 || 
            (error.status === 500 && this.isAuthorizationException(error))) {
          return this.handleTokenExpiration(request, next);
        }
        
        return throwError(() => error);
      })
    );
  }

  private handleTokenExpiration(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authRepository.refreshToken().pipe(
        switchMap((result) => {
          this.isRefreshing = false;
          
          if (result.isOk && result.value?.accessToken) {
            const newAccessToken = result.value.accessToken.token;
            this.refreshTokenSubject.next(newAccessToken);
            
            const updatedRequest = request.clone({
              setHeaders: {
                Authorization: `Bearer ${newAccessToken}`
              }
            });
            return next.handle(updatedRequest);
          } else {
            this.handleLogout();
            return throwError(() => new Error('Token refresh failed'));
          }
        }),
        catchError((refreshError) => {
          this.isRefreshing = false;
          this.handleLogout();
          return throwError(() => refreshError);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap((newToken) => {
          const updatedRequest = request.clone({
            setHeaders: {
              Authorization: `Bearer ${newToken}`
            }
          });
          return next.handle(updatedRequest);
        })
      );
    }
  }

  private isAuthorizationException(error: HttpErrorResponse): boolean {
    try {
      if (error.error && typeof error.error === 'string') {
        return error.error.includes('AuthorizationException') || 
               error.error.includes('You are not authorized');
      }
      return false;
    } catch {
      return false;
    }
  }

  private handleLogout(): void {
    localStorage.removeItem('AccessToken');
    localStorage.removeItem('UserRoles');
    localStorage.removeItem('UserId');
    localStorage.removeItem('UserName');
    this.router.navigate(['/login']);
  }
}
