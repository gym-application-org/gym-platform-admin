import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { Staff, StaffsFilter } from '../../services/api/models/staff';
import { StaffRepository } from './staff-repository';

@Injectable()
export class StaffRepositoryRemote implements StaffRepository {
  constructor(private apiClient: ApiClientService) {}

  getStaffs(filter: StaffsFilter): Observable<Result<Page<Staff>>> {
    return this.apiClient.getStaffs(filter);
  }

  getStaffById(id: string): Observable<Result<Staff>> {
    return this.apiClient.getStaffById(id);
  }
}
