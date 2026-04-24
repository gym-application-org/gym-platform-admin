import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { AttendanceLog, AttendanceLogsFilter } from '../../services/api/models/attendance-log';

export interface AttendanceLogRepository {
  getAttendanceLogs(filter: AttendanceLogsFilter): Observable<Result<Page<AttendanceLog>>>;
}
