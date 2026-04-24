import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { SupportTicket, UpdateSupportTicketRequest, SupportTicketsFilter } from '../../services/api/models/support-ticket';

export interface SupportTicketRepository {
  getSupportTickets(filter: SupportTicketsFilter): Observable<Result<Page<SupportTicket>>>;
  getSupportTicketById(id: number): Observable<Result<SupportTicket>>;
  updateSupportTicket(id: number, request: UpdateSupportTicketRequest): Observable<Result<SupportTicket>>;
  deleteSupportTicket(id: number): Observable<Result<void>>;
}
