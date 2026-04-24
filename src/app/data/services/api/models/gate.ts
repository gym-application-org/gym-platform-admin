export interface Gate {
  id: number;
  tenantId: string;
  name: string;
  gateCode: string;
  isActive: boolean;
}

export interface CreateGateRequest {
  tenantId: string;
  name: string;
  gateCode: string;
  isActive: boolean;
}

export interface UpdateGateRequest {
  id: number;
  tenantId: string;
  name: string;
  gateCode: string;
  isActive: boolean;
}

export interface GatesFilter {
  pageIndex: number;
  pageSize: number;
  tenantId?: string;
}
