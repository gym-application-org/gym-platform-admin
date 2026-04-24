import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { Staff, StaffsFilter } from '../../services/api/models/staff';

export interface StaffRepository {
  getStaffs(filter: StaffsFilter): Observable<Result<Page<Staff>>>;
  getStaffById(id: string): Observable<Result<Staff>>;
}
