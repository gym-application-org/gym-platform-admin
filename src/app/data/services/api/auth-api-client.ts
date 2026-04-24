import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Result } from '../../../utils/result';
import { ErrorExtractor } from '../../../utils/error-extractor';
import { Credentials } from './models/credentials';
import { LoginResponse } from './models/login-response';
import { environment } from '../../../../environments/environment';
import {
  CreateOperationClaimRequest,
  OperationClaim,
  UpdateOperationClaimRequest,
} from './models/operation-claim';
import { Page } from './models/page';
import { userOperationClaim } from './models/user-operation-claim';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(credentials: Credentials): Observable<Result<LoginResponse>> {
    const url = `${this.apiUrl}/api/Auth/Login`;
    return this.http.post<LoginResponse>(url, credentials).pipe(
      map((response) => {
        return Result.ok(response);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  refreshToken(): Observable<Result<LoginResponse>> {
    const url = `${this.apiUrl}/api/Auth/RefreshToken`;
    
    return this.http.get<any>(url).pipe(
      map((response) => {
        const loginResponse: LoginResponse = {
          accessToken: {
            token: response.token,
            expiration: response.expiration,
          },
        };
        return Result.ok(loginResponse);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  revokeToken(): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/Auth/RevokeToken`;
    
    return this.http.put<void>(url, null).pipe(
      map(() => {
        return Result.ok(undefined);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  getOperationClaims(pageIndex: number, pageSize: number): Observable<Result<any>> {
    const url = `${this.apiUrl}/api/OperationClaims?PageIndex=${pageIndex}&PageSize=${pageSize}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        return Result.ok(response);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  getOperationClaimById(id: number): Observable<Result<OperationClaim>> {
    const url = `${this.apiUrl}/api/OperationClaims/${id}`;
    return this.http.get<OperationClaim>(url).pipe(
      map((response) => Result.ok(response)),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  createOperationClaim(request: CreateOperationClaimRequest): Observable<Result<OperationClaim>> {
    const url = `${this.apiUrl}/api/OperationClaims`;
    return this.http.post<OperationClaim>(url, request).pipe(
      map((response) => Result.ok(response)),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  updateOperationClaim(
    id: number,
    request: UpdateOperationClaimRequest
  ): Observable<Result<OperationClaim>> {
    const url = `${this.apiUrl}/api/OperationClaims/${id}`;
    return this.http.put<OperationClaim>(url, request).pipe(
      map((response) => Result.ok(response)),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  deleteOperationClaim(id: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/OperationClaims`;
    return this.http
      .request<void>('DELETE', url, {
        body: { id },
      })
      .pipe(
        map(() => Result.ok(undefined)),
        catchError((error: HttpErrorResponse) => {
          const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
          return of(Result.error(new Error(meaningfulMessage)));
        })
      );
  }

  getUserOperationClaimsList(
    pageIndex: number,
    pageSize: number
  ): Observable<Result<Page<userOperationClaim>>> {
    const url = `${this.apiUrl}/api/UserOperationClaims`;
    const params = new HttpParams()
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString());
    return this.http.get<Page<userOperationClaim>>(url, { params }).pipe(
      map((response) => Result.ok(response)),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  deleteUserOperationClaim(linkId: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/UserOperationClaims`;
    return this.http
      .request<void>('DELETE', url, {
        body: { id: linkId },
      })
      .pipe(
        map(() => Result.ok(undefined)),
        catchError((error: HttpErrorResponse) => {
          const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
          return of(Result.error(new Error(meaningfulMessage)));
        })
      );
  }

  getUserOperationClaimsByUserId(id: number): Observable<Result<any>> {
    const url = `${this.apiUrl}/api/useroperationclaims/by-user-id/${id}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        return Result.ok(response);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }

  updateUserOperationClaimsByUserId(userId: number, operationClaimIds: number[]): Observable<Result<any>> {
    const url = `${this.apiUrl}/api/UserOperationClaims/update-user-operation-claims`;
    const requestBody = {
      userId: userId,
      operationClaimIds: operationClaimIds
    };
    return this.http.put<any>(url, requestBody).pipe(
      map((response) => {
        return Result.ok(response);
      }),
      catchError((error: HttpErrorResponse) => {
        const meaningfulMessage = ErrorExtractor.extractErrorMessage(error);
        return of(Result.error(new Error(meaningfulMessage)));
      })
    );
  }
}