export interface OperationClaim {
  id: number;
  name: string;
}

export interface CreateOperationClaimRequest {
  name: string;
}

export interface UpdateOperationClaimRequest {
  id: number;
  name: string;
}
