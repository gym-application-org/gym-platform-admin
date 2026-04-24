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

import { MEMBER_REPOSITORY, TENANT_REPOSITORY } from '../../config/repository.tokens';
import { Member } from '../../data/services/api/models/member';
import { MemberStatus, MEMBER_STATUS_LABELS } from '../../data/services/api/models/enum-labels';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-members-page',
  standalone: true,
  imports: [DatePipe, AppButtonComponent],
  templateUrl: './members-page.component.html',
  styleUrl: './members-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembersPageComponent {
  private readonly membersRepo = inject(MEMBER_REPOSITORY);
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly toast = inject(ToastService);

  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');

  protected readonly loading = signal(false);
  protected readonly tenantsLoading = signal(false);
  protected readonly pageItems = signal<Member[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly tenantOptions = signal<{ id: string; name: string }[]>([]);
  protected readonly filterTenantId = signal<string>('');
  protected readonly filterStatus = signal<'' | MemberStatus>('');

  protected readonly searchQuery = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailMember = signal<Member | null>(null);

  protected readonly statusLabels = MEMBER_STATUS_LABELS;
  protected readonly memberStatusEnum = MemberStatus;

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter((m) => {
      const name = `${m.firstName} ${m.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.phone.toLowerCase().includes(q)
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

  protected statusBadgeClass(status: MemberStatus): string {
    switch (status) {
      case MemberStatus.Active:
        return 'members-page__badge--active';
      case MemberStatus.Suspended:
        return 'members-page__badge--suspended';
      case MemberStatus.Pending:
        return 'members-page__badge--pending';
      default:
        return 'members-page__badge--muted';
    }
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

  protected onStatusFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    if (raw === '') {
      this.filterStatus.set('');
    } else {
      this.filterStatus.set(Number(raw) as MemberStatus);
    }
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const tenantId = this.filterTenantId().trim() || undefined;
      const statusRaw = this.filterStatus();
      const status = statusRaw === '' ? undefined : statusRaw;

      const result = await firstValueFrom(
        this.membersRepo.getMembers({
          pageIndex: this.pageIndex(),
          pageSize: this.pageSize(),
          tenantId,
          status,
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
      const message = e instanceof Error ? e.message : 'Could not load members.';
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

  protected async openDetail(member: Member): Promise<void> {
    this.detailMember.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.membersRepo.getMemberById(member.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailMember.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load member.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailMember.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }
}
