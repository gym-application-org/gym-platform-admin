import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { STAFF_REPOSITORY, TENANT_REPOSITORY } from '../../config/repository.tokens';
import { Staff } from '../../data/services/api/models/staff';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

type ActiveFilter = '' | 'active' | 'inactive';

@Component({
  selector: 'app-staff-page',
  standalone: true,
  imports: [DatePipe, AppButtonComponent],
  templateUrl: './staff-page.component.html',
  styleUrl: './staff-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffPageComponent {
  private readonly staffRepo = inject(STAFF_REPOSITORY);
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly toast = inject(ToastService);

  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');

  protected readonly loading = signal(false);
  protected readonly tenantsLoading = signal(false);
  protected readonly pageItems = signal<Staff[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly tenantOptions = signal<{ id: string; name: string }[]>([]);
  protected readonly filterTenantId = signal<string>('');
  protected readonly filterActive = signal<ActiveFilter>('');

  protected readonly searchQuery = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailStaff = signal<Staff | null>(null);

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const activeF = this.filterActive();
    let items = this.pageItems();

    if (activeF === 'active') {
      items = items.filter((s) => s.isActive);
    } else if (activeF === 'inactive') {
      items = items.filter((s) => !s.isActive);
    }

    if (!q) {
      return items;
    }
    return items.filter((s) => {
      const name = `${s.firstName} ${s.lastName}`.toLowerCase();
      const role = (s.role ?? '').toLowerCase();
      return (
        name.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        (s.phone ?? '').toLowerCase().includes(q) ||
        role.includes(q)
      );
    });
  });

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    await this.loadTenantOptions();
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
      const opts = result.value.items.map((t: Tenant) => ({ id: t.id, name: t.name }));
      this.tenantOptions.set(opts);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load tenants for filter.');
    } finally {
      this.tenantsLoading.set(false);
    }
  }

  protected tenantLabel(tenantId: string): string {
    const found = this.tenantOptions().find((o) => o.id === tenantId);
    return found?.name ?? tenantId;
  }

  protected activeBadgeClass(isActive: boolean): string {
    return isActive ? 'staff-page__badge--active' : 'staff-page__badge--inactive';
  }

  protected onSearchInputEvent(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected onTenantFilterChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.filterTenantId.set(v);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onActiveFilterChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value as ActiveFilter;
    this.filterActive.set(v === 'active' || v === 'inactive' ? v : '');
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const tenantId = this.filterTenantId().trim() || undefined;

      const result = await firstValueFrom(
        this.staffRepo.getStaffs({
          pageIndex: this.pageIndex(),
          pageSize: this.pageSize(),
          tenantId,
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
      const message = e instanceof Error ? e.message : 'Could not load staff.';
      this.toast.error(message);
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

  protected async openDetail(staff: Staff): Promise<void> {
    this.detailStaff.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.staffRepo.getStaffById(staff.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailStaff.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load staff member.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailStaff.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }
}
