export interface Staff {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface StaffsFilter {
  pageIndex: number;
  pageSize: number;
  tenantId?: string;
}
