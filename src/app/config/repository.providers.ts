import { Provider } from '@angular/core';
import {
  AUTH_REPOSITORY,
  ATTENDANCE_LOG_REPOSITORY,
  EXERCISE_REPOSITORY,
  GATE_REPOSITORY,
  MEMBER_REPOSITORY,
  STAFF_REPOSITORY,
  SUPPORT_TICKET_REPOSITORY,
  TENANT_REPOSITORY,
  USER_REPOSITORY,
} from './repository.tokens';
import { AuthRepositoryLocal } from '../data/repository/auth/auth-remote-repository';
import { AttendanceLogRepositoryRemote } from '../data/repository/attendance-log/attendance-log-repository-remote';
import { ExerciseRepositoryRemote } from '../data/repository/exercise/exercise-repository-remote';
import { GateRepositoryRemote } from '../data/repository/gate/gate-repository-remote';
import { MemberRepositoryRemote } from '../data/repository/member/member-repository-remote';
import { StaffRepositoryRemote } from '../data/repository/staff/staff-repository-remote';
import { SupportTicketRepositoryRemote } from '../data/repository/support-ticket/support-ticket-repository-remote';
import { TenantRepositoryRemote } from '../data/repository/tenant/tenant-repository-remote';
import { UserRepositoryRemote } from '../data/repository/user/user-repository-remote';

/**
 * Default repository bindings (remote API). Replace `useClass` with a caching decorator
 * or composite implementation later without changing consumers that inject the tokens.
 */
export const repositoryProviders: Provider[] = [
  { provide: AUTH_REPOSITORY, useClass: AuthRepositoryLocal },
  { provide: ATTENDANCE_LOG_REPOSITORY, useClass: AttendanceLogRepositoryRemote },
  { provide: EXERCISE_REPOSITORY, useClass: ExerciseRepositoryRemote },
  { provide: GATE_REPOSITORY, useClass: GateRepositoryRemote },
  { provide: MEMBER_REPOSITORY, useClass: MemberRepositoryRemote },
  { provide: STAFF_REPOSITORY, useClass: StaffRepositoryRemote },
  { provide: SUPPORT_TICKET_REPOSITORY, useClass: SupportTicketRepositoryRemote },
  { provide: TENANT_REPOSITORY, useClass: TenantRepositoryRemote },
  { provide: USER_REPOSITORY, useClass: UserRepositoryRemote },
];
