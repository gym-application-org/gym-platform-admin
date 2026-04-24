import type { TicketPriority, TicketStatus } from './enum-labels';

export interface SupportTicket {
  id: number;
  tenantId: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  closedAt?: string;
}

export interface UpdateSupportTicketRequest {
  id: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  closedAt?: string;
}

export interface SupportTicketsFilter {
  pageIndex: number;
  pageSize: number;
  from?: string;
  to?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  tenantId?: string;
}
