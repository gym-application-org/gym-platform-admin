import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../data/services/api/auth-api-client';
import { OperationClaim } from '../../data/services/api/models/operation-claim';
import { AuthorizationService } from '../../services/authorization.service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { AppTextFieldComponent } from '../../shared/ui/fields/app-text-field.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-operation-claims-page',
  standalone: true,
  imports: [ReactiveFormsModule, AppTextFieldComponent, AppButtonComponent],
  templateUrl: './operation-claims-page.component.html',
  styleUrl: './operation-claims-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationClaimsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly authz = inject(AuthorizationService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly createDialogRef = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly canRead = signal(false);
  protected readonly canEdit = signal(false);

  protected readonly loading = signal(false);
  protected readonly pageItems = signal<OperationClaim[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly searchQuery = signal('');

  protected readonly createSubmitting = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly deleteSubmitting = signal(false);
  protected readonly claimPendingDelete = signal<OperationClaim | null>(null);

  private editingClaimId: number | null = null;

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
  });

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    const [read, edit] = await Promise.all([
      this.authz.canReadUsers(),
      this.authz.canManageOperationClaimsCatalog(),
    ]);
    this.canRead.set(read);
    this.canEdit.set(edit);
    if (read) {
      await this.loadPage();
    }
  }

  protected filteredItems(): OperationClaim[] {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter(
      (c) => c.name.toLowerCase().includes(q) || String(c.id).includes(q)
    );
  }

  protected onSearchInputEvent(ev: Event): void {
    this.searchQuery.set((ev.target as HTMLInputElement).value);
  }

  protected async loadPage(): Promise<void> {
    if (!this.canRead()) {
      return;
    }
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.auth.getOperationClaims(this.pageIndex(), this.pageSize())
      );
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      const page = result.value as {
        items: OperationClaim[];
        count: number;
        pages: number;
        hasPrevious: boolean;
        hasNext: boolean;
      };
      const items = page?.items ?? (page as unknown as { Items?: OperationClaim[] }).Items ?? [];
      this.pageItems.set(items);
      this.totalCount.set(page.count ?? (page as unknown as { Count?: number }).Count ?? 0);
      this.totalPages.set(page.pages ?? (page as unknown as { Pages?: number }).Pages ?? 0);
      this.hasPrevious.set(
        page.hasPrevious ?? (page as unknown as { HasPrevious?: boolean }).HasPrevious ?? false
      );
      this.hasNext.set(page.hasNext ?? (page as unknown as { HasNext?: boolean }).HasNext ?? false);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load operation claims.');
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

  protected openCreate(): void {
    this.createForm.reset({ name: '' });
    this.createForm.markAsPristine();
    this.createDialogRef()?.nativeElement.showModal();
  }

  protected closeCreate(): void {
    this.createDialogRef()?.nativeElement.close();
  }

  protected onCreateBackdrop(ev: MouseEvent): void {
    const el = this.createDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
    }
  }

  protected async submitCreate(): Promise<void> {
    if (this.createForm.invalid) {
      this.createForm.markAllAsTouched();
      return;
    }
    this.createSubmitting.set(true);
    try {
      const { name } = this.createForm.getRawValue();
      const result = await firstValueFrom(this.auth.createOperationClaim({ name: name.trim() }));
      if (!this.handleResult(result, 'Operation claim created.')) {
        return;
      }
      this.closeCreate();
      this.pageIndex.set(0);
      await this.loadPage();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Create failed.');
    } finally {
      this.createSubmitting.set(false);
    }
  }

  protected openEdit(claim: OperationClaim): void {
    this.editingClaimId = claim.id;
    this.editForm.patchValue({ name: claim.name });
    this.editForm.markAsPristine();
    this.editDialogRef()?.nativeElement.showModal();
  }

  protected closeEdit(): void {
    this.editingClaimId = null;
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
      this.editingClaimId = null;
    }
  }

  protected async submitEdit(): Promise<void> {
    const id = this.editingClaimId;
    if (id == null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editSubmitting.set(true);
    try {
      const { name } = this.editForm.getRawValue();
      const result = await firstValueFrom(
        this.auth.updateOperationClaim(id, { id, name: name.trim() })
      );
      if (!this.handleResult(result, 'Operation claim updated.')) {
        return;
      }
      this.closeEdit();
      await this.loadPage();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Update failed.');
    } finally {
      this.editSubmitting.set(false);
    }
  }

  protected confirmDelete(claim: OperationClaim): void {
    this.claimPendingDelete.set(claim);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.claimPendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const claim = this.claimPendingDelete();
    if (!claim) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.auth.deleteOperationClaim(claim.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Operation claim deleted.');
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

  protected createNameError(): string {
    const c = this.createForm.controls.name;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Name is required.';
    }
    if (c.hasError('maxLength')) {
      return 'Name is too long.';
    }
    return '';
  }

  protected editNameError(): string {
    const c = this.editForm.controls.name;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Name is required.';
    }
    if (c.hasError('maxLength')) {
      return 'Name is too long.';
    }
    return '';
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
