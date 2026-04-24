export interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
  subdomain: string;
  ownerName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CreateTenantRequest {
  tenantName: string;
  tenantIsActive: boolean;
  tenantSubdomain: string;
  ownerName: string;
  email: string;
  phone: string;
}

export interface UpdateTenantRequest {
  id: string;
  name: string;
  isActive: boolean;
}
