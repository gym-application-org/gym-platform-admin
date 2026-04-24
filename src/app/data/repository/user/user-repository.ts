import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { User, CreateUserRequest, UpdateUserRequest } from '../../services/api/models/user';

export interface UserRepository {
  getUserById(id: number): Observable<Result<User>>;
  getUsers(pageIndex: number, pageSize: number): Observable<Result<Page<User>>>;
  createUser(request: CreateUserRequest): Observable<Result<User>>;
  updateUser(id: number, request: UpdateUserRequest): Observable<Result<User>>;
  deleteUser(id: number): Observable<Result<void>>;
}
