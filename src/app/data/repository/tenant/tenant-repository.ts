import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { Page } from '../../services/api/models/page';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../services/api/models/tenant';

export interface TenantRepository {
  getTenants(pageIndex: number, pageSize: number): Observable<Result<Page<Tenant>>>;
  getTenantById(id: string): Observable<Result<Tenant>>;
  createTenant(request: CreateTenantRequest): Observable<Result<Tenant>>;
  updateTenant(id: string, request: UpdateTenantRequest): Observable<Result<Tenant>>;
  deleteTenant(id: string): Observable<Result<void>>;
}
