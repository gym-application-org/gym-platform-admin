import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { SUPPORT_TICKET_REPOSITORY, TENANT_REPOSITORY } from '../../config/repository.tokens';
import {
  TicketPriority,
  TicketStatus,
  TICKET_PRIORITY_LABELS,
  TICKET_STATUS_LABELS,
} from '../../data/services/api/models/enum-labels';
import { SupportTicket, UpdateSupportTicketRequest } from '../../data/services/api/models/support-ticket';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';

function startOfDayIso(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toISOString();
}

function endOfDayIso(dateStr: string): string {
  const d = new Date(`${dateStr}T23:59:59.999`);
  return d.toISOString();
}

@Component({
  selector: 'app-support-tickets-page',
  standalone: true,
  imports: [DatePipe, AppButtonComponent],
  templateUrl: './support-tickets-page.component.html',
  styleUrl: './support-tickets-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupportTicketsPageComponent {
  private readonly ticketsRepo = inject(SUPPORT_TICKET_REPOSITORY);
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly toast = inject(ToastService);

  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly loading = signal(false);
  protected readonly tenantsLoading = signal(false);
  protected readonly pageItems = signal<SupportTicket[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly tenantOptions = signal<{ id: string; name: string }[]>([]);
  protected readonly filterTenantId = signal('');
  protected readonly filterStatus = signal<'' | TicketStatus>('');
  protected readonly filterPriority = signal<'' | TicketPriority>('');
  protected readonly filterFrom = signal('');
  protected readonly filterTo = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailTicket = signal<SupportTicket | null>(null);

  protected readonly editLoading = signal(false);
  protected readonly editSaving = signal(false);
  protected readonly editId = signal<number | null>(null);
  protected readonly editTitle = signal('');
  protected readonly editDescription = signal('');
  protected readonly editStatus = signal<TicketStatus>(TicketStatus.Open);
  protected readonly editPriority = signal<TicketPriority>(TicketPriority.Medium);
  protected readonly editClosedAt = signal('');

  protected readonly deletePending = signal<{ id: number; title: string } | null>(null);
  protected readonly deleteLoading = signal(false);

  protected readonly statusLabels = TICKET_STATUS_LABELS;
  protected readonly priorityLabels = TICKET_PRIORITY_LABELS;
  protected readonly ticketStatusEnum = TicketStatus;
  protected readonly ticketPriorityEnum = TicketPriority;

  protected previewText(text: string, max = 80): string {
    if (!text || text.length <= max) {
      return text ?? '';
    }
    return `${text.slice(0, max)}…`;
  }

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
      this.toast.error(e instanceof Error ? e.message : 'Could not load organizations for filter.');
    } finally {
      this.tenantsLoading.set(false);
    }
  }

  protected tenantLabel(tenantId: string): string {
    const found = this.tenantOptions().find((o) => o.id === tenantId);
    return found?.name ?? tenantId;
  }

  protected statusBadgeClass(status: TicketStatus): string {
    switch (status) {
      case TicketStatus.Open:
        return 'support-page__badge--open';
      case TicketStatus.InProgress:
        return 'support-page__badge--progress';
      case TicketStatus.Resolved:
        return 'support-page__badge--resolved';
      case TicketStatus.Closed:
        return 'support-page__badge--closed';
      default:
        return 'support-page__badge--muted';
    }
  }

  protected priorityBadgeClass(priority: TicketPriority): string {
    switch (priority) {
      case TicketPriority.Urgent:
        return 'support-page__prio--urgent';
      case TicketPriority.High:
        return 'support-page__prio--high';
      case TicketPriority.Medium:
        return 'support-page__prio--medium';
      case TicketPriority.Low:
        return 'support-page__prio--low';
      default:
        return 'support-page__prio--muted';
    }
  }

  protected onTenantFilterChange(ev: Event): void {
    this.filterTenantId.set((ev.target as HTMLSelectElement).value);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onStatusFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    this.filterStatus.set(raw === '' ? '' : (Number(raw) as TicketStatus));
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onPriorityFilterChange(ev: Event): void {
    const raw = (ev.target as HTMLSelectElement).value;
    this.filterPriority.set(raw === '' ? '' : (Number(raw) as TicketPriority));
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onFromChange(ev: Event): void {
    this.filterFrom.set((ev.target as HTMLInputElement).value);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onToChange(ev: Event): void {
    this.filterTo.set((ev.target as HTMLInputElement).value);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected clearDateFilters(): void {
    this.filterFrom.set('');
    this.filterTo.set('');
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const tenantId = this.filterTenantId().trim() || undefined;
      const st = this.filterStatus();
      const pr = this.filterPriority();
      const fromRaw = this.filterFrom().trim();
      const toRaw = this.filterTo().trim();

      const result = await firstValueFrom(
        this.ticketsRepo.getSupportTickets({
          pageIndex: this.pageIndex(),
          pageSize: this.pageSize(),
          tenantId,
          status: st === '' ? undefined : st,
          priority: pr === '' ? undefined : pr,
          from: fromRaw ? startOfDayIso(fromRaw) : undefined,
          to: toRaw ? endOfDayIso(toRaw) : undefined,
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
      this.toast.error(e instanceof Error ? e.message : 'Could not load support tickets.');
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

  protected async openDetail(ticket: SupportTicket): Promise<void> {
    this.detailTicket.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.ticketsRepo.getSupportTicketById(ticket.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailTicket.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load ticket.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailTicket.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }

  protected async openEdit(ticket: SupportTicket): Promise<void> {
    this.editLoading.set(true);
    this.editDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.ticketsRepo.getSupportTicketById(ticket.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.editDialogRef()?.nativeElement.close();
        return;
      }
      const t = result.value;
      this.editId.set(t.id);
      this.editTitle.set(t.title);
      this.editDescription.set(t.description);
      this.editStatus.set(t.status);
      this.editPriority.set(t.priority);
      this.editClosedAt.set(t.closedAt ? this.toDatetimeLocalValue(t.closedAt) : '');
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load ticket.');
      this.editDialogRef()?.nativeElement.close();
    } finally {
      this.editLoading.set(false);
    }
  }

  private toDatetimeLocalValue(iso: string): string {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return '';
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  protected closeEdit(): void {
    this.editId.set(null);
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el && !this.editSaving()) {
      this.closeEdit();
    }
  }

  protected onEditTitleInput(ev: Event): void {
    this.editTitle.set((ev.target as HTMLInputElement).value);
  }

  protected onEditDescriptionInput(ev: Event): void {
    this.editDescription.set((ev.target as HTMLTextAreaElement).value);
  }

  protected onEditStatusChange(ev: Event): void {
    this.editStatus.set(Number((ev.target as HTMLSelectElement).value) as TicketStatus);
  }

  protected onEditPriorityChange(ev: Event): void {
    this.editPriority.set(Number((ev.target as HTMLSelectElement).value) as TicketPriority);
  }

  protected onEditClosedAtInput(ev: Event): void {
    this.editClosedAt.set((ev.target as HTMLInputElement).value);
  }

  protected async saveEdit(): Promise<void> {
    const id = this.editId();
    if (id == null) {
      return;
    }
    const title = this.editTitle().trim();
    if (!title) {
      this.toast.error('Title is required.');
      return;
    }

    let closedAt: string | undefined;
    const rawClosed = this.editClosedAt().trim();
    if (rawClosed) {
      closedAt = new Date(rawClosed).toISOString();
    } else if (
      this.editStatus() === TicketStatus.Closed ||
      this.editStatus() === TicketStatus.Resolved
    ) {
      closedAt = new Date().toISOString();
    }

    const body: UpdateSupportTicketRequest = {
      id,
      title,
      description: this.editDescription(),
      status: this.editStatus(),
      priority: this.editPriority(),
      ...(closedAt !== undefined ? { closedAt } : {}),
    };

    this.editSaving.set(true);
    try {
      const result = await firstValueFrom(this.ticketsRepo.updateSupportTicket(id, body));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Ticket updated.');
      this.closeEdit();
      await this.loadPage();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      this.editSaving.set(false);
    }
  }

  protected openDeleteConfirm(ticket: SupportTicket): void {
    this.deletePending.set({ id: ticket.id, title: ticket.title });
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.deletePending.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el && !this.deleteLoading()) {
      this.closeDelete();
    }
  }

  protected async confirmDelete(): Promise<void> {
    const p = this.deletePending();
    if (!p) {
      return;
    }
    this.deleteLoading.set(true);
    try {
      const result = await firstValueFrom(this.ticketsRepo.deleteSupportTicket(p.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Ticket deleted.');
      this.closeDelete();
      await this.loadPage();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      this.deleteLoading.set(false);
    }
  }
}
