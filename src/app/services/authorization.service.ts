import { Injectable, Inject } from '@angular/core';
import { AuthRepository } from '../data/repository/auth/auth-repository';
import { LocalStorageService } from '../data/services/local-storage-service';
import { Router } from '@angular/router';
import { AUTH_REPOSITORY } from '../config/repository.tokens';
import { isTokenExpired } from '../utils/jwt-helper';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  constructor(
    @Inject(AUTH_REPOSITORY) private authRepository: AuthRepository,
    private localStorage: LocalStorageService,
    private router: Router
  ) {}

  async hasToken(): Promise<boolean> {
    try {
      const tokenResult = await this.localStorage.getAccessToken();
      return tokenResult.isOk && !!tokenResult.value;
    } catch {
      return false;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const tokenResult = await this.localStorage.getAccessToken();
      if (!tokenResult.isOk || !tokenResult.value) return false;
      return !isTokenExpired(tokenResult.value);
    } catch {
      return false;
    }
  }

  async getUserRoles(): Promise<string[]> {
    try {
      return (await this.authRepository.getRoles()) ?? [];
    } catch {
      return [];
    }
  }

  async hasAnyRole(requiredRoles: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return requiredRoles.some((role) => userRoles.includes(role));
  }

  async hasAllRoles(requiredRoles: string[]): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return requiredRoles.every((role) => userRoles.includes(role));
  }

  async hasRole(role: string): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return userRoles.includes(role);
  }

  async hasPermission(permission: string): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return userRoles.includes('Admin') || userRoles.includes(permission);
  }

  async isAdmin(): Promise<boolean> {
    return this.hasRole('Admin');
  }

  async isModuleAdmin(module: string): Promise<boolean> {
    const userRoles = await this.getUserRoles();
    return userRoles.includes('Admin') || userRoles.includes(`${module}.Admin`);
  }

  async canAccessUsers(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin', 'users.read', 'users.write', 'users.add', 'users.update', 'users.delete']);
  }

  async canReadUsers(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin', 'users.read']);
  }

  async canAddUsers(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin', 'users.add']);
  }

  async canUpdateUsers(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin', 'users.update']);
  }

  async canDeleteUsers(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin', 'users.delete']);
  }

  async canManageUserClaims(): Promise<boolean> {
    if (await this.isAdmin()) {
      return true;
    }
    return this.hasAllRoles([
      'users.update',
      'useroperationclaims.add',
      'useroperationclaims.update',
      'useroperationclaims.delete',
    ]);
  }

  /** List / CRUD operation claim definitions (catalog). */
  async canManageOperationClaimsCatalog(): Promise<boolean> {
    return this.hasAnyRole(['Admin', 'users.admin']);
  }

  /** Browse all user ↔ operation claim rows (matrix / audit). */
  async canViewUserOperationClaimsDirectory(): Promise<boolean> {
    return this.canReadUsers();
  }

  async logout(): Promise<void> {
    await this.authRepository.logout();
    this.router.navigate(['/login']);
  }
}
