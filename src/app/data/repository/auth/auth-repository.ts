import { Observable } from "rxjs";
import { Result } from "../../../utils/result";
import { Credentials } from "../../services/api/models/credentials";
import { LoginResponse } from "../../services/api/models/login-response";
import { OperationClaim } from "../../services/api/models/operation-claim";
import { Page } from "../../services/api/models/page";
import { userOperationClaim } from "../../services/api/models/user-operation-claim";

export interface AuthRepository {
    login(credentials: Credentials): Observable<Result<LoginResponse>>;
    logout(): Promise<void>;
    refreshToken(): Observable<Result<LoginResponse>>;
    getOperationClaims(pageIndex: number, pageSize: number ): Observable<Result<Page<OperationClaim>>>;
    getUserOperationClaimsByUserId(id: number): Observable<Result<Page<userOperationClaim>>>;
    updateUserOperationClaimsByUserId(userId: number, operationClaimIds: number[]) :Observable<Result<Page<any>>>;
    getRoles(): Promise<string[]>;
    getUserId(): Promise<number | null>;
    getUserName(): Promise<string | null>;
    isAuthenticated(): Promise<boolean>;
}