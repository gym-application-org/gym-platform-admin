import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { AttendanceLog, AttendanceLogsFilter } from '../../services/api/models/attendance-log';
import { AttendanceLogRepository } from './attendance-log-repository';

@Injectable()
export class AttendanceLogRepositoryRemote implements AttendanceLogRepository {
  constructor(private apiClient: ApiClientService) {}

  getAttendanceLogs(filter: AttendanceLogsFilter): Observable<Result<Page<AttendanceLog>>> {
    return this.apiClient.getAttendanceLogs(filter);
  }
}
