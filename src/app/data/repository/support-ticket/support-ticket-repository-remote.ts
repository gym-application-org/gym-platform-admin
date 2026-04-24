import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { SupportTicket, UpdateSupportTicketRequest, SupportTicketsFilter } from '../../services/api/models/support-ticket';
import { SupportTicketRepository } from './support-ticket-repository';

@Injectable()
export class SupportTicketRepositoryRemote implements SupportTicketRepository {
  constructor(private apiClient: ApiClientService) {}

  getSupportTickets(filter: SupportTicketsFilter): Observable<Result<Page<SupportTicket>>> {
    return this.apiClient.getSupportTickets(filter);
  }

  getSupportTicketById(id: number): Observable<Result<SupportTicket>> {
    return this.apiClient.getSupportTicketById(id);
  }

  updateSupportTicket(id: number, request: UpdateSupportTicketRequest): Observable<Result<SupportTicket>> {
    return this.apiClient.updateSupportTicket(id, request);
  }

  deleteSupportTicket(id: number): Observable<Result<void>> {
    return this.apiClient.deleteSupportTicket(id);
  }
}
