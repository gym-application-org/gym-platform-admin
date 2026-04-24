import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Result } from '../../../utils/result';
import { ErrorExtractor } from '../../../utils/error-extractor';
import { Page } from './models/page';
import { AttendanceLog, AttendanceLogsFilter } from './models/attendance-log';
import { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from './models/exercise';
import { Gate, CreateGateRequest, UpdateGateRequest, GatesFilter } from './models/gate';
import { Member, MembersFilter } from './models/member';
import { Staff, StaffsFilter } from './models/staff';
import { SupportTicket, UpdateSupportTicketRequest, SupportTicketsFilter } from './models/support-ticket';
import { Tenant, CreateTenantRequest, UpdateTenantRequest } from './models/tenant';
import { User, CreateUserRequest, UpdateUserRequest } from './models/user';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private readonly apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  private handleError<T>(error: HttpErrorResponse): Observable<Result<T>> {
    const message = ErrorExtractor.extractErrorMessage(error);
    return of(Result.error<T>(new Error(message)));
  }

  // ─── Attendance Logs ──────────────────────────────────────────────────────

  getAttendanceLogs(filter: AttendanceLogsFilter): Observable<Result<Page<AttendanceLog>>> {
    const url = `${this.apiUrl}/api/admin/attendance-logs`;
    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex.toString())
      .set('PageSize', filter.pageSize.toString());

    if (filter.tenantId) params = params.set('tenantId', filter.tenantId);
    if (filter.memberId) params = params.set('memberId', filter.memberId);
    if (filter.gateId != null) params = params.set('gateId', filter.gateId.toString());
    if (filter.result != null) params = params.set('result', filter.result.toString());
    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);

    return this.http.get<Page<AttendanceLog>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<AttendanceLog>>(err))
    );
  }

  // ─── Exercises ────────────────────────────────────────────────────────────

  getExercises(pageIndex: number, pageSize: number): Observable<Result<Page<Exercise>>> {
    const url = `${this.apiUrl}/api/exercises`;
    const params = new HttpParams()
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<Page<Exercise>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<Exercise>>(err))
    );
  }

  createExercise(request: CreateExerciseRequest): Observable<Result<Exercise>> {
    const url = `${this.apiUrl}/api/admin/exercises`;
    return this.http.post<Exercise>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Exercise>(err))
    );
  }

  updateExercise(id: number, request: UpdateExerciseRequest): Observable<Result<Exercise>> {
    const url = `${this.apiUrl}/api/admin/exercises/${id}`;
    return this.http.put<Exercise>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Exercise>(err))
    );
  }

  deleteExercise(id: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/admin/exercises/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => Result.ok(undefined)),
      catchError((err: HttpErrorResponse) => this.handleError<void>(err))
    );
  }

  // ─── Gates ────────────────────────────────────────────────────────────────

  getGates(filter: GatesFilter): Observable<Result<Page<Gate>>> {
    const url = `${this.apiUrl}/api/admin/gates`;
    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex.toString())
      .set('PageSize', filter.pageSize.toString());

    if (filter.tenantId) params = params.set('tenantId', filter.tenantId);

    return this.http.get<Page<Gate>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<Gate>>(err))
    );
  }

  getGateById(id: number): Observable<Result<Gate>> {
    const url = `${this.apiUrl}/api/admin/gates/${id}`;
    return this.http.get<Gate>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Gate>(err))
    );
  }

  createGate(request: CreateGateRequest): Observable<Result<Gate>> {
    const url = `${this.apiUrl}/api/admin/gates`;
    return this.http.post<Gate>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Gate>(err))
    );
  }

  updateGate(id: number, request: UpdateGateRequest): Observable<Result<Gate>> {
    const url = `${this.apiUrl}/api/admin/gates/${id}`;
    return this.http.put<Gate>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Gate>(err))
    );
  }

  deleteGate(id: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/admin/gates/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => Result.ok(undefined)),
      catchError((err: HttpErrorResponse) => this.handleError<void>(err))
    );
  }

  // ─── Members ──────────────────────────────────────────────────────────────

  getMembers(filter: MembersFilter): Observable<Result<Page<Member>>> {
    const url = `${this.apiUrl}/api/admin/members`;
    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex.toString())
      .set('PageSize', filter.pageSize.toString());

    if (filter.status != null) params = params.set('status', filter.status.toString());
    if (filter.tenantId) params = params.set('tenantId', filter.tenantId);

    return this.http.get<Page<Member>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<Member>>(err))
    );
  }

  getMemberById(id: string): Observable<Result<Member>> {
    const url = `${this.apiUrl}/api/admin/members/${id}`;
    return this.http.get<Member>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Member>(err))
    );
  }

  // ─── Staffs ───────────────────────────────────────────────────────────────

  getStaffs(filter: StaffsFilter): Observable<Result<Page<Staff>>> {
    const url = `${this.apiUrl}/api/admin/staffs`;
    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex.toString())
      .set('PageSize', filter.pageSize.toString());

    if (filter.tenantId) params = params.set('tenantId', filter.tenantId);

    return this.http.get<Page<Staff>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<Staff>>(err))
    );
  }

  getStaffById(id: string): Observable<Result<Staff>> {
    const url = `${this.apiUrl}/api/admin/staffs/${id}`;
    return this.http.get<Staff>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Staff>(err))
    );
  }

  // ─── Support Tickets ──────────────────────────────────────────────────────

  getSupportTickets(filter: SupportTicketsFilter): Observable<Result<Page<SupportTicket>>> {
    const url = `${this.apiUrl}/api/admin/support-tickets`;
    let params = new HttpParams()
      .set('PageIndex', filter.pageIndex.toString())
      .set('PageSize', filter.pageSize.toString());

    if (filter.from) params = params.set('from', filter.from);
    if (filter.to) params = params.set('to', filter.to);
    if (filter.status != null) params = params.set('status', filter.status.toString());
    if (filter.priority != null) params = params.set('priority', filter.priority.toString());
    if (filter.tenantId) params = params.set('tenantId', filter.tenantId);

    return this.http.get<Page<SupportTicket>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<SupportTicket>>(err))
    );
  }

  getSupportTicketById(id: number): Observable<Result<SupportTicket>> {
    const url = `${this.apiUrl}/api/admin/support-tickets/${id}`;
    return this.http.get<SupportTicket>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<SupportTicket>(err))
    );
  }

  updateSupportTicket(id: number, request: UpdateSupportTicketRequest): Observable<Result<SupportTicket>> {
    const url = `${this.apiUrl}/api/admin/support-tickets/${id}`;
    return this.http.put<SupportTicket>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<SupportTicket>(err))
    );
  }

  deleteSupportTicket(id: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/admin/support-tickets/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => Result.ok(undefined)),
      catchError((err: HttpErrorResponse) => this.handleError<void>(err))
    );
  }

  // ─── Tenants ──────────────────────────────────────────────────────────────

  getTenants(pageIndex: number, pageSize: number): Observable<Result<Page<Tenant>>> {
    const url = `${this.apiUrl}/api/admin/tenants`;
    const params = new HttpParams()
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<Page<Tenant>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<Tenant>>(err))
    );
  }

  getTenantById(id: string): Observable<Result<Tenant>> {
    const url = `${this.apiUrl}/api/admin/tenants/${id}`;
    return this.http.get<Tenant>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Tenant>(err))
    );
  }

  createTenant(request: CreateTenantRequest): Observable<Result<Tenant>> {
    const url = `${this.apiUrl}/api/admin/tenants`;
    return this.http.post<Tenant>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Tenant>(err))
    );
  }

  updateTenant(id: string, request: UpdateTenantRequest): Observable<Result<Tenant>> {
    const url = `${this.apiUrl}/api/admin/tenants/${id}`;
    return this.http.put<Tenant>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Tenant>(err))
    );
  }

  deleteTenant(id: string): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/admin/tenants/${id}`;
    return this.http.delete<void>(url).pipe(
      map(() => Result.ok(undefined)),
      catchError((err: HttpErrorResponse) => this.handleError<void>(err))
    );
  }

  // ─── Users (/api/Users, Postman) ─────────────────────────────────────────

  getUserById(id: number): Observable<Result<User>> {
    const url = `${this.apiUrl}/api/Users/${id}`;
    return this.http.get<User>(url).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<User>(err))
    );
  }

  getUsers(pageIndex: number, pageSize: number): Observable<Result<Page<User>>> {
    const url = `${this.apiUrl}/api/Users`;
    const params = new HttpParams()
      .set('PageIndex', pageIndex.toString())
      .set('PageSize', pageSize.toString());

    return this.http.get<Page<User>>(url, { params }).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<Page<User>>(err))
    );
  }

  createUser(request: CreateUserRequest): Observable<Result<User>> {
    const url = `${this.apiUrl}/api/Users`;
    return this.http.post<User>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<User>(err))
    );
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<Result<User>> {
    const url = `${this.apiUrl}/api/Users/${id}`;
    return this.http.put<User>(url, request).pipe(
      map((res) => Result.ok(res)),
      catchError((err: HttpErrorResponse) => this.handleError<User>(err))
    );
  }

  deleteUser(id: number): Observable<Result<void>> {
    const url = `${this.apiUrl}/api/Users`;
    return this.http.request<void>('DELETE', url, {
      body: { id },
    }).pipe(
      map(() => Result.ok(undefined)),
      catchError((err: HttpErrorResponse) => this.handleError<void>(err))
    );
  }
}
