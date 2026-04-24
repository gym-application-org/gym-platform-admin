import { InjectionToken } from '@angular/core';
import { AuthRepository } from '../data/repository/auth/auth-repository';
import { AttendanceLogRepository } from '../data/repository/attendance-log/attendance-log-repository';
import { ExerciseRepository } from '../data/repository/exercise/exercise-repository';
import { GateRepository } from '../data/repository/gate/gate-repository';
import { MemberRepository } from '../data/repository/member/member-repository';
import { StaffRepository } from '../data/repository/staff/staff-repository';
import { SupportTicketRepository } from '../data/repository/support-ticket/support-ticket-repository';
import { TenantRepository } from '../data/repository/tenant/tenant-repository';
import { UserRepository } from '../data/repository/user/user-repository';

/** Central tokens: inject these so implementations can be swapped (e.g. remote vs cached) in one place. */
export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AUTH_REPOSITORY');
export const ATTENDANCE_LOG_REPOSITORY = new InjectionToken<AttendanceLogRepository>('ATTENDANCE_LOG_REPOSITORY');
export const EXERCISE_REPOSITORY = new InjectionToken<ExerciseRepository>('EXERCISE_REPOSITORY');
export const GATE_REPOSITORY = new InjectionToken<GateRepository>('GATE_REPOSITORY');
export const MEMBER_REPOSITORY = new InjectionToken<MemberRepository>('MEMBER_REPOSITORY');
export const STAFF_REPOSITORY = new InjectionToken<StaffRepository>('STAFF_REPOSITORY');
export const SUPPORT_TICKET_REPOSITORY = new InjectionToken<SupportTicketRepository>('SUPPORT_TICKET_REPOSITORY');
export const TENANT_REPOSITORY = new InjectionToken<TenantRepository>('TENANT_REPOSITORY');
export const USER_REPOSITORY = new InjectionToken<UserRepository>('USER_REPOSITORY');
