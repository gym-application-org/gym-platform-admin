import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { User, CreateUserRequest, UpdateUserRequest } from '../../services/api/models/user';
import { UserRepository } from './user-repository';

@Injectable()
export class UserRepositoryRemote implements UserRepository {
  constructor(private apiClient: ApiClientService) {}

  getUserById(id: number): Observable<Result<User>> {
    return this.apiClient.getUserById(id);
  }

  getUsers(pageIndex: number, pageSize: number): Observable<Result<Page<User>>> {
    return this.apiClient.getUsers(pageIndex, pageSize);
  }

  createUser(request: CreateUserRequest): Observable<Result<User>> {
    return this.apiClient.createUser(request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<Result<User>> {
    return this.apiClient.updateUser(id, request);
  }

  deleteUser(id: number): Observable<Result<void>> {
    return this.apiClient.deleteUser(id);
  }
}
