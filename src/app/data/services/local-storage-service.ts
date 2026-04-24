import { Injectable } from '@angular/core';
import { Result } from '../../utils/result';


@Injectable({ providedIn: 'root' })
export class LocalStorageService {
  private readonly LAST_LOGIN_USER_KEY = 'LastLoginUser';
  private readonly ACCESS_TOKEN_KEY = 'AccessToken';
  private readonly ROLES_KEY = 'Roles';
  private readonly USER_ID_KEY = 'UserId';
  private readonly USER_NAME_KEY = 'UserName';
  private readonly IDENTIFIER_KEY = 'Identifier';

  constructor() {}

  async getAccessToken(): Promise<Result<string | null>> {
    try {
      const token = localStorage.getItem(this.ACCESS_TOKEN_KEY);
      return Result.ok(token);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setAccessToken(accessToken: string | null): Promise<Result<void>> {
    try {
      if (accessToken === null) {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      } else {
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getUserId(): Promise<Result<number | null>> {
    try {
      const value = localStorage.getItem(this.USER_ID_KEY);
      return Result.ok(value ? Number(value) : null);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setUserId(userId: number | null): Promise<Result<void>> {
    try {
      if (userId === null) {
        localStorage.removeItem(this.USER_ID_KEY);
      } else {
        localStorage.setItem(this.USER_ID_KEY, userId.toString());
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getRoles(): Promise<Result<string[]>> {
    try {
      const roles = localStorage.getItem(this.ROLES_KEY);
      return Result.ok(roles ? JSON.parse(roles) : []);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setRoles(roles: string[] | null): Promise<Result<void>> {
    try {
      if (roles === null) {
        localStorage.removeItem(this.ROLES_KEY);
      } else {
        localStorage.setItem(this.ROLES_KEY, JSON.stringify(roles));
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getIdentifier(): Promise<Result<string | null>> {
    try {
      const identifier = localStorage.getItem(this.IDENTIFIER_KEY);
      return Result.ok(identifier);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setIdentifier(identifier: string | null): Promise<Result<void>> {
    try {
      if (identifier === null) {
        localStorage.removeItem(this.IDENTIFIER_KEY);
      } else {
        localStorage.setItem(this.IDENTIFIER_KEY, identifier);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getLastLoginUser(): Promise<Result<string | null>> {
    try {
      const value = localStorage.getItem(this.LAST_LOGIN_USER_KEY);
      return Result.ok(value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setLastLoginUser(value: string | null): Promise<Result<void>> {
    try {
      if (value === null) {
        localStorage.removeItem(this.LAST_LOGIN_USER_KEY);
      } else {
        localStorage.setItem(this.LAST_LOGIN_USER_KEY, value);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async getUserName(): Promise<Result<string | null>> {
    try {
      const value = localStorage.getItem(this.USER_NAME_KEY);
      return Result.ok(value);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async setUserName(value: string | null): Promise<Result<void>> {
    try {
      if (value === null) {
        localStorage.removeItem(this.USER_NAME_KEY);
      } else {
        localStorage.setItem(this.USER_NAME_KEY, value);
      }
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  async clear(): Promise<Result<void>> {
    try {
      localStorage.clear();
      return Result.ok(undefined);
    } catch (error) {
      return Result.error(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Generic storage methods for form data
  setItem(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  getItem(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from localStorage:', error);
    }
  }
}
