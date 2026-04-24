import type { MemberStatus } from './enum-labels';

export interface Member {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: MemberStatus;
  createdAt: string;
}

export interface MembersFilter {
  pageIndex: number;
  pageSize: number;
  status?: MemberStatus;
  tenantId?: string;
}
