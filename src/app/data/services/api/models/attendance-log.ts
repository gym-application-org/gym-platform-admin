import type { AttendanceResult } from './enum-labels';

export interface AttendanceLog {
  id: number;
  tenantId: string;
  memberId: string;
  gateId: number;
  result: AttendanceResult;
  timestamp: string;
}

export interface AttendanceLogsFilter {
  pageIndex: number;
  pageSize: number;
  tenantId?: string;
  memberId?: string;
  gateId?: number;
  result?: AttendanceResult;
  from?: string;
  to?: string;
}
