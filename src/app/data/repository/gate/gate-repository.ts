import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { Gate, CreateGateRequest, UpdateGateRequest, GatesFilter } from '../../services/api/models/gate';

export interface GateRepository {
  getGates(filter: GatesFilter): Observable<Result<Page<Gate>>>;
  getGateById(id: number): Observable<Result<Gate>>;
  createGate(request: CreateGateRequest): Observable<Result<Gate>>;
  updateGate(id: number, request: UpdateGateRequest): Observable<Result<Gate>>;
  deleteGate(id: number): Observable<Result<void>>;
}
