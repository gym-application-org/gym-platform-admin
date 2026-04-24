import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Result } from '../../../utils/result';
import { ApiClientService } from '../../services/api/api-client';
import { Page } from '../../services/api/models/page';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from '../../services/api/models/tenant';
import { TenantRepository } from './tenant-repository';

@Injectable()
export class TenantRepositoryRemote implements TenantRepository {
  constructor(private apiClient: ApiClientService) {}

  getTenants(pageIndex: number, pageSize: number): Observable<Result<Page<Tenant>>> {
    return this.apiClient.getTenants(pageIndex, pageSize);
  }

  getTenantById(id: string): Observable<Result<Tenant>> {
    return this.apiClient.getTenantById(id);
  }

  createTenant(request: CreateTenantRequest): Observable<Result<Tenant>> {
    return this.apiClient.createTenant(request);
  }

  updateTenant(id: string, request: UpdateTenantRequest): Observable<Result<Tenant>> {
    return this.apiClient.updateTenant(id, request);
  }

  deleteTenant(id: string): Observable<Result<void>> {
    return this.apiClient.deleteTenant(id);
  }
}
