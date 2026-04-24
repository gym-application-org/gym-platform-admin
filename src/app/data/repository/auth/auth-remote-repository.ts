import { Injectable } from '@angular/core';
import { Result } from '../../../utils/result';
import { Observable, tap } from 'rxjs';
import { AuthRepository } from './auth-repository';
import { AuthService } from '../../services/api/auth-api-client';
import { Credentials } from '../../services/api/models/credentials';
import { LoginResponse } from '../../services/api/models/login-response';
import { LocalStorageService } from '../../services/local-storage-service';
import { decodeToken } from '../../../utils/jwt-helper';
import { OperationClaim } from '../../services/api/models/operation-claim';
import { Page } from '../../services/api/models/page';
import { userOperationClaim } from '../../services/api/models/user-operation-claim';

@Injectable()
export class AuthRepositoryLocal implements AuthRepository {
  private currentRefreshToken: string | null = null;

  constructor(
    private authClient: AuthService,
    private localStorage: LocalStorageService
  ) {}

  login(credentials: Credentials): Observable<Result<LoginResponse>> {
    return this.authClient.login(credentials).pipe(
      tap(async (result) => {
        if (result.isOk && result.value?.accessToken) {
          const token = result.value.accessToken.token;
          const decoded = decodeToken(token);

          const roles = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const roleArray: string[] = Array.isArray(roles) ? roles : roles ? [roles] : [];
          const identifier = decoded?.['identifier'];

          await this.localStorage.setAccessToken(token);
          await this.localStorage.setRoles(roleArray);

          if (identifier) {
            await this.localStorage.setIdentifier(identifier);
          }

          if (result.value.refreshToken) {
            this.currentRefreshToken = result.value.refreshToken.token;
          }
        }
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.authClient.revokeToken().toPromise();
    } catch {
      // silently ignored
    }
    await this.localStorage.clear();
    this.currentRefreshToken = null;
  }

  getOperationClaims(pageIndex: number, pageSize: number): Observable<Result<Page<OperationClaim>>> {
    return this.authClient.getOperationClaims(pageIndex, pageSize);
  }

  getUserOperationClaimsByUserId(id: number): Observable<Result<Page<userOperationClaim>>> {
    return this.authClient.getUserOperationClaimsByUserId(id);
  }

  updateUserOperationClaimsByUserId(userId: number, operationClaimIds: number[]): Observable<Result<Page<any>>> {
    return this.authClient.updateUserOperationClaimsByUserId(userId, operationClaimIds);
  }

  async getRoles(): Promise<string[]> {
    const result = await this.localStorage.getRoles();
    return result.isOk ? result.value : [];
  }

  async getUserId(): Promise<number | null> {
    const result = await this.localStorage.getUserId();
    return result.isOk ? result.value : null;
  }

  async getUserName(): Promise<string | null> {
    const result = await this.localStorage.getUserName();
    return result.isOk ? result.value : null;
  }

  async isAuthenticated(): Promise<boolean> {
    const tokenResult = await this.localStorage.getAccessToken();
    return tokenResult.isOk && !!tokenResult.value;
  }

  refreshToken(): Observable<Result<LoginResponse>> {
    return this.authClient.refreshToken().pipe(
      tap(async (result) => {
        if (result.isOk && result.value?.accessToken) {
          const token = result.value.accessToken.token;
          const decoded = decodeToken(token);

          const roles = decoded?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
          const roleArray: string[] = Array.isArray(roles) ? roles : roles ? [roles] : [];
          const identifier = decoded?.['identifier'];

          await this.localStorage.setAccessToken(token);
          await this.localStorage.setRoles(roleArray);
          if (identifier) {
            await this.localStorage.setIdentifier(identifier);
          }
        }
      })
    );
  }
}
