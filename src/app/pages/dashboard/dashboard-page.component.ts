import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin, from, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { ApiClientService } from '../../data/services/api/api-client';
import { AttendanceLog } from '../../data/services/api/models/attendance-log';
import {
  AttendanceResult,
  TicketStatus,
} from '../../data/services/api/models/enum-labels';
import { Page } from '../../data/services/api/models/page';
import { AuthorizationService } from '../../services/authorization.service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { Result } from '../../utils/result';

export interface DashboardCounts {
  tenants: number | null;
  members: number | null;
  staff: number | null;
  gates: number | null;
  exercises: number | null;
  ticketsOpen: number | null;
  users: number | null;
}

export interface DashboardQuickLink {
  label: string;
  path: string;
  description: string;
  requiresUsersAccess?: boolean;
}

const QUICK_LINKS: DashboardQuickLink[] = [
  {
    label: 'Tenants',
    path: '/tenants',
    description: 'Organizations, subdomains, and activation',
  },
  {
    label: 'User management',
    path: '/user-management',
    description: 'Platform users and permissions',
    requiresUsersAccess: true,
  },
  {
    label: 'Members',
    path: '/members',
    description: 'Member directory across tenants',
  },
  {
    label: 'Staff',
    path: '/staff',
    description: 'Staff directory',
  },
  {
    label: 'Gates',
    path: '/gates',
    description: 'Access gates and codes',
  },
  {
    label: 'Exercises',
    path: '/exercises',
    description: 'Exercise library',
  },
  {
    label: 'Attendance',
    path: '/attendance-logs',
    description: 'Check-in audit trail',
  },
  {
    label: 'Support',
    path: '/support-tickets',
    description: 'Tenant support tickets',
  },
];

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, DatePipe, AppButtonComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent implements OnInit {
  protected readonly AttendanceResult = AttendanceResult;

  private readonly api = inject(ApiClientService);
  private readonly authz = inject(AuthorizationService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly loading = signal(true);
  protected readonly loadError = signal<string | null>(null);
  protected readonly counts = signal<DashboardCounts | null>(null);
  protected readonly recentLogs = signal<AttendanceLog[]>([]);
  protected readonly showUsersLink = signal(false);
  protected readonly refreshLoading = signal(false);

  protected readonly quickLinks = signal<DashboardQuickLink[]>(
    QUICK_LINKS.filter((l) => !l.requiresUsersAccess)
  );

  ngOnInit(): void {
    this.loadDashboard();
  }

  protected refresh(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    const isRefresh = !this.loading();
    if (isRefresh) {
      this.refreshLoading.set(true);
    } else {
      this.loading.set(true);
    }
    this.loadError.set(null);

    from(this.authz.canAccessUsers())
      .pipe(
        switchMap((canUsers) => {
          this.showUsersLink.set(canUsers);
          this.quickLinks.set(
            QUICK_LINKS.filter((l) => !l.requiresUsersAccess || canUsers)
          );

          return forkJoin({
            tenants: this.countPage(this.api.getTenants(0, 1)),
            members: this.countPage(
              this.api.getMembers({ pageIndex: 0, pageSize: 1 })
            ),
            staff: this.countPage(
              this.api.getStaffs({ pageIndex: 0, pageSize: 1 })
            ),
            gates: this.countPage(
              this.api.getGates({ pageIndex: 0, pageSize: 1 })
            ),
            exercises: this.countPage(this.api.getExercises(0, 1)),
            ticketsOpen: this.countPage(
              this.api.getSupportTickets({
                pageIndex: 0,
                pageSize: 1,
                status: TicketStatus.Open,
              })
            ),
            users: canUsers
              ? this.countPage(this.api.getUsers(0, 1))
              : of(null),
            recentLogs: this.api
              .getAttendanceLogs({ pageIndex: 0, pageSize: 5 })
              .pipe(
                map((r) => (Result.isOk(r) ? r.value.items : [])),
                catchError(() => of([] as AttendanceLog[]))
              ),
          });
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          const { recentLogs, ...rest } = data;
          this.counts.set(rest);
          this.recentLogs.set(recentLogs);
          this.loading.set(false);
          this.refreshLoading.set(false);
        },
        error: () => {
          this.loadError.set('Could not load dashboard data. Try again in a moment.');
          this.loading.set(false);
          this.refreshLoading.set(false);
        },
      });
  }

  private countPage(obs: Observable<Result<Page<unknown>>>): Observable<number | null> {
    return obs.pipe(
      map((r) => (Result.isOk(r) ? r.value.count : null)),
      catchError(() => of(null))
    );
  }
}
