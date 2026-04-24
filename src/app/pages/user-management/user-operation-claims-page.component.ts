import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../data/services/api/auth-api-client';
import { OperationClaim } from '../../data/services/api/models/operation-claim';
import { Page } from '../../data/services/api/models/page';
import { userOperationClaim } from '../../data/services/api/models/user-operation-claim';
import { AuthorizationService } from '../../services/authorization.service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-user-operation-claims-page',
  standalone: true,
  imports: [AppButtonComponent],
  templateUrl: './user-operation-claims-page.component.html',
  styleUrl: './user-operation-claims-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserOperationClaimsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly authz = inject(AuthorizationService);
  private readonly toast = inject(ToastService);

  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly canRead = signal(false);
  protected readonly canDelete = signal(false);

  protected readonly loading = signal(false);
  protected readonly pageItems = signal<userOperationClaim[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly claimNames = signal<Record<number, string>>({});
  protected readonly searchQuery = signal('');

  protected readonly deleteSubmitting = signal(false);
  protected readonly linkPendingDelete = signal<userOperationClaim | null>(null);

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    const [read, del] = await Promise.all([
      this.authz.canViewUserOperationClaimsDirectory(),
      this.authz.canManageUserClaims(),
    ]);
    this.canRead.set(read);
    this.canDelete.set(del);
    if (read) {
      await this.hydrateClaimNames();
      await this.loadPage();
    }
  }

  protected filteredItems(): userOperationClaim[] {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    const names = this.claimNames();
    if (!q) {
      return items;
    }
    return items.filter((row) => {
      const cn = names[row.operationClaimId] ?? '';
      return (
        String(row.userId).includes(q) ||
        String(row.operationClaimId).includes(q) ||
        String(row.id).includes(q) ||
        cn.toLowerCase().includes(q)
      );
    });
  }

  protected onSearchInputEvent(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  protected claimName(id: number): string {
    return this.claimNames()[id] ?? '—';
  }

  private async hydrateClaimNames(): Promise<void> {
    try {
      const all = await this.fetchAllOperationClaims();
      const map: Record<number, string> = {};
      for (const c of all) {
        map[c.id] = c.name;
      }
      this.claimNames.set(map);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load claim names.');
    }
  }

  private async fetchAllOperationClaims(): Promise<OperationClaim[]> {
    const out: OperationClaim[] = [];
    let pageIndex = 0;
    const pageSize = 100;
    for (;;) {
      const result = await firstValueFrom(this.auth.getOperationClaims(pageIndex, pageSize));
      if (!result.isOk) {
        throw new Error(result.error.message);
      }
      const raw = result.value as Page<OperationClaim> & {
        Items?: OperationClaim[];
        HasNext?: boolean;
      };
      const items = raw?.items ?? raw?.Items ?? [];
      out.push(...items);
      const hasNext = raw?.hasNext ?? raw?.HasNext ?? false;
      if (!hasNext) {
        break;
      }
      pageIndex += 1;
    }
    return out;
  }

  protected async loadPage(): Promise<void> {
    if (!this.canRead()) {
      return;
    }
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.auth.getUserOperationClaimsList(this.pageIndex(), this.pageSize())
      );
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      const page = result.value;
      this.pageItems.set(page.items ?? []);
      this.totalCount.set(page.count);
      this.totalPages.set(page.pages);
      this.hasPrevious.set(page.hasPrevious);
      this.hasNext.set(page.hasNext);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load assignments.');
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

  protected confirmDelete(row: userOperationClaim): void {
    this.linkPendingDelete.set(row);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.linkPendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const row = this.linkPendingDelete();
    if (!row) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.auth.deleteUserOperationClaim(row.id));
      if (!this.handleResult(result, 'Assignment removed.')) {
        return;
      }
      this.closeDelete();
      if (this.pageItems().length <= 1 && this.pageIndex() > 0) {
        this.pageIndex.update((i) => Math.max(0, i - 1));
      }
      await this.loadPage();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Delete failed.');
    } finally {
      this.deleteSubmitting.set(false);
    }
  }

  private handleResult<T>(result: Result<T>, successMsg: string): boolean {
    if (result.isOk) {
      this.toast.success(successMsg);
      return true;
    }
    this.toast.error(result.error.message);
    return false;
  }
}
