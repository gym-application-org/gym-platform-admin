import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import {
  ATTENDANCE_LOG_REPOSITORY,
  GATE_REPOSITORY,
  TENANT_REPOSITORY,
} from '../../config/repository.tokens';
import { AttendanceLog } from '../../data/services/api/models/attendance-log';
import {
  AttendanceResult,
  ATTENDANCE_RESULT_LABELS,
} from '../../data/services/api/models/enum-labels';
import { Gate } from '../../data/services/api/models/gate';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function toIsoFromDatetimeLocal(v: string): string | undefined {
  const t = v?.trim();
  if (!t) return undefined;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

@Component({
  selector: 'app-attendance-logs-page',
  standalone: true,
  imports: [DatePipe, AppButtonComponent],
  templateUrl: './attendance-logs-page.component.html',
  styleUrl: './attendance-logs-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttendanceLogsPageComponent {
  private readonly attendanceRepo = inject(ATTENDANCE_LOG_REPOSITORY);
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly gatesRepo = inject(GATE_REPOSITORY);
  private readonly toast = inject(ToastService);

  protected readonly loading = signal(false);
  protected readonly tenantsLoading = signal(false);
  protected readonly gatesLoading = signal(false);
  protected readonly pageItems = signal<AttendanceLog[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(25);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly tenantOptions = signal<{ id: string; name: string }[]>([]);
  protected readonly gateOptions = signal<{ id: number; label: string }[]>([]);

  protected readonly filterTenantId = signal('');
  protected readonly filterResult = signal<'' | AttendanceResult>('');
  protected readonly filterMemberId = signal('');
  protected readonly filterGateId = signal<'' | number>('');
  protected readonly filterFromLocal = signal('');
  protected readonly filterToLocal = signal('');

  protected readonly resultLabels = ATTENDANCE_RESULT_LABELS;
  protected readonly attendanceResultEnum = AttendanceResult;

  protected readonly exportDisabled = computed(
    () => this.loading() || this.pageItems().length === 0
  );

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.loadTenantOptions();
    await this.loadGateOptions();
    await this.loadPage();
  }

  private async loadTenantOptions(): Promise<void> {
    this.tenantsLoading.set(true);
    try {
      const result = await firstValueFrom(this.tenantsRepo.getTenants(0, 100));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.tenantOptions.set(result.value.items.map((t: Tenant) => ({ id: t.id, name: t.name })));
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load organizations.');
    } finally {
      this.tenantsLoading.set(false);
    }
  }

  private async loadGateOptions(): Promise<void> {
    this.gatesLoading.set(true);
    try {
      const tenantId = this.filterTenantId().trim() || undefined;
      const result = await firstValueFrom(
        this.gatesRepo.getGates({
          pageIndex: 0,
          pageSize: 200,
          tenantId,
        })
      );
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.gateOptions.set([]);
        return;
      }
      const opts = result.value.items.map((g: Gate) => ({
        id: g.id,
        label: `${g.name} (${g.gateCode})`,
      }));
      this.gateOptions.set(opts);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load gates.');
      this.gateOptions.set([]);
    } finally {
      this.gatesLoading.set(false);
    }
  }

  protected tenantLabel(tenantId: string): string {
    const found = this.tenantOptions().find((o) => o.id === tenantId);
    return found?.name ?? tenantId;
  }

  protected resultBadgeClass(result: AttendanceResult): string {
    return result === AttendanceResult.Allowed
      ? 'attendance-page__badge--allowed'
      : 'attendance-page__badge--denied';
  }

  protected onTenantFilterChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.filterTenantId.set(v);
    this.filterGateId.set('');
    this.pageIndex.set(0);
    void this.loadGateOptions().then(() => this.loadPage());
  }

  protected onResultFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    if (raw === '') {
      this.filterResult.set('');
    } else {
      this.filterResult.set(Number(raw) as AttendanceResult);
    }
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onGateFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    if (raw === '') {
      this.filterGateId.set('');
    } else {
      this.filterGateId.set(Number(raw));
    }
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onMemberIdInput(ev: Event): void {
    this.filterMemberId.set((ev.target as HTMLInputElement).value);
  }

  protected applyMemberIdFilter(): void {
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onFromChange(ev: Event): void {
    this.filterFromLocal.set((ev.target as HTMLInputElement).value);
  }

  protected onToChange(ev: Event): void {
    this.filterToLocal.set((ev.target as HTMLInputElement).value);
  }

  protected applyDateFilters(): void {
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected presetToday(): void {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 0, 0);
    this.filterFromLocal.set(toDatetimeLocalValue(start));
    this.filterToLocal.set(toDatetimeLocalValue(end));
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected presetLastDays(days: number): void {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);
    this.filterFromLocal.set(toDatetimeLocalValue(start));
    this.filterToLocal.set(toDatetimeLocalValue(end));
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected clearDates(): void {
    this.filterFromLocal.set('');
    this.filterToLocal.set('');
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected resetFilters(): void {
    this.filterTenantId.set('');
    this.filterResult.set('');
    this.filterMemberId.set('');
    this.filterGateId.set('');
    this.filterFromLocal.set('');
    this.filterToLocal.set('');
    this.pageIndex.set(0);
    void this.loadGateOptions().then(() => this.loadPage());
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const tenantId = this.filterTenantId().trim() || undefined;
      const memberId = this.filterMemberId().trim() || undefined;
      const fg = this.filterGateId();
      const gateId: number | undefined = typeof fg === 'number' ? fg : undefined;
      const fr = this.filterResult();
      const resultFilter: AttendanceResult | undefined =
        fr === '' ? undefined : (fr as AttendanceResult);
      const from = toIsoFromDatetimeLocal(this.filterFromLocal());
      const to = toIsoFromDatetimeLocal(this.filterToLocal());

      const result = await firstValueFrom(
        this.attendanceRepo.getAttendanceLogs({
          pageIndex: this.pageIndex(),
          pageSize: this.pageSize(),
          tenantId,
          memberId,
          gateId,
          result: resultFilter,
          from,
          to,
        })
      );
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      const page = result.value;
      this.pageItems.set(page.items);
      this.totalCount.set(page.count);
      this.totalPages.set(page.pages);
      this.hasPrevious.set(page.hasPrevious);
      this.hasNext.set(page.hasNext);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load attendance logs.');
    } finally {
      this.loading.set(false);
    }
  }

  protected onPageSizeChange(ev: Event): void {
    const v = Number((ev.target as HTMLSelectElement).value);
    if (!Number.isFinite(v) || v < 1) {
      return;
    }
    this.pageSize.set(v);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected goPrev(): void {
    if (!this.hasPrevious()) {
      return;
    }
    this.pageIndex.update((i) => Math.max(0, i - 1));
    void this.loadPage();
  }

  protected goNext(): void {
    if (!this.hasNext()) {
      return;
    }
    this.pageIndex.update((i) => i + 1);
    void this.loadPage();
  }

  protected exportCsv(): void {
    const rows = this.pageItems();
    if (!rows.length) {
      return;
    }
    const header = ['id', 'tenantId', 'memberId', 'gateId', 'result', 'timestamp'];
    const escape = (s: string | number) => {
      const t = String(s);
      if (/[",\n]/.test(t)) {
        return `"${t.replace(/"/g, '""')}"`;
      }
      return t;
    };
    const lines = [
      header.join(','),
      ...rows.map((r) =>
        [
          r.id,
          r.tenantId,
          r.memberId,
          r.gateId,
          this.resultLabels[r.result],
          r.timestamp,
        ]
          .map(escape)
          .join(',')
      ),
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-logs-page-${this.pageIndex() + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
