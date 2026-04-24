/**
 * Mirrors backend `Domain.Enums` (gym-platform-api). Use for selects, badges, and filters
 * where API models expose `number` fields: Member.status, SupportTicket.status/priority,
 * AttendanceLog.result, Exercise.difficultyLevel.
 */

export enum MemberStatus {
  Active = 1,
  Suspended = 2,
  Pending = 3,
}

export const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  [MemberStatus.Active]: 'Active',
  [MemberStatus.Suspended]: 'Suspended',
  [MemberStatus.Pending]: 'Pending',
};

export enum TicketStatus {
  Open = 1,
  InProgress = 2,
  Resolved = 3,
  Closed = 4,
}

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  [TicketStatus.Open]: 'Open',
  [TicketStatus.InProgress]: 'In progress',
  [TicketStatus.Resolved]: 'Resolved',
  [TicketStatus.Closed]: 'Closed',
};

export enum TicketPriority {
  Low = 1,
  Medium = 2,
  High = 3,
  Urgent = 4,
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  [TicketPriority.Low]: 'Low',
  [TicketPriority.Medium]: 'Medium',
  [TicketPriority.High]: 'High',
  [TicketPriority.Urgent]: 'Urgent',
};

export enum AttendanceResult {
  Allowed = 1,
  Denied = 2,
}

export const ATTENDANCE_RESULT_LABELS: Record<AttendanceResult, string> = {
  [AttendanceResult.Allowed]: 'Allowed',
  [AttendanceResult.Denied]: 'Denied',
};

export enum DifficultyLevel {
  Beginner = 1,
  Intermediate = 2,
  Advanced = 3,
}

export const DIFFICULTY_LEVEL_LABELS: Record<DifficultyLevel, string> = {
  [DifficultyLevel.Beginner]: 'Beginner',
  [DifficultyLevel.Intermediate]: 'Intermediate',
  [DifficultyLevel.Advanced]: 'Advanced',
};

/** Backend `StaffRole`; useful if `Staff.role` is aligned to numeric values. */
export enum StaffRole {
  Owner = 1,
  Staff = 2,
}

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  [StaffRole.Owner]: 'Owner',
  [StaffRole.Staff]: 'Staff',
};
