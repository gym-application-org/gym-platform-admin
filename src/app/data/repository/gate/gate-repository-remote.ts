import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { Gate, CreateGateRequest, UpdateGateRequest, GatesFilter } from '../../services/api/models/gate';
import { GateRepository } from './gate-repository';

@Injectable()
export class GateRepositoryRemote implements GateRepository {
  constructor(private apiClient: ApiClientService) {}

  getGates(filter: GatesFilter): Observable<Result<Page<Gate>>> {
    return this.apiClient.getGates(filter);
  }

  getGateById(id: number): Observable<Result<Gate>> {
    return this.apiClient.getGateById(id);
  }

  createGate(request: CreateGateRequest): Observable<Result<Gate>> {
    return this.apiClient.createGate(request);
  }

  updateGate(id: number, request: UpdateGateRequest): Observable<Result<Gate>> {
    return this.apiClient.updateGate(id, request);
  }

  deleteGate(id: number): Observable<Result<void>> {
    return this.apiClient.deleteGate(id);
  }
}
