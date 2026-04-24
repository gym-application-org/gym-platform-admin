import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { ApiClientService } from '../../data/services/api/api-client';
import { AuthService } from '../../data/services/api/auth-api-client';
import { OperationClaim } from '../../data/services/api/models/operation-claim';
import { Page } from '../../data/services/api/models/page';
import { userOperationClaim } from '../../data/services/api/models/user-operation-claim';
import { User } from '../../data/services/api/models/user';
import { AuthorizationService } from '../../services/authorization.service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { AppTextFieldComponent } from '../../shared/ui/fields/app-text-field.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [ReactiveFormsModule, AppTextFieldComponent, AppButtonComponent],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent {
  private readonly api = inject(ApiClientService);
  private readonly auth = inject(AuthService);
  private readonly authz = inject(AuthorizationService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly createDialogRef = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');
  private readonly claimsDialogRef = viewChild<ElementRef<HTMLDialogElement>>('claimsDialog');

  protected readonly permissionsLoaded = signal(false);
  protected readonly canRead = signal(false);
  protected readonly canAdd = signal(false);
  protected readonly canUpdate = signal(false);
  protected readonly canDelete = signal(false);
  protected readonly canManageClaims = signal(false);

  protected readonly loading = signal(false);
  protected readonly pageItems = signal<User[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly searchQuery = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailUser = signal<User | null>(null);

  protected readonly createSubmitting = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly deleteSubmitting = signal(false);

  protected readonly userPendingDelete = signal<User | null>(null);

  protected readonly claimsLoading = signal(false);
  protected readonly claimsSaving = signal(false);
  protected readonly claimsAll = signal<OperationClaim[]>([]);
  protected readonly claimsSelectedIds = signal<number[]>([]);
  protected readonly claimsSearchQuery = signal('');
  private claimsUserId: number | null = null;

  private editingUserId: number | null = null;

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter((u) => {
      const name = `${u.firstName} ${u.lastName}`.toLowerCase();
      return name.includes(q) || u.email.toLowerCase().includes(q);
    });
  });

  protected readonly filteredClaims = computed(() => {
    const q = this.claimsSearchQuery().trim().toLowerCase();
    const all = this.claimsAll();
    if (!q) {
      return all;
    }
    return all.filter(
      (c) => c.name.toLowerCase().includes(q) || String(c.id).includes(q)
    );
  });

  protected readonly createForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    lastName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(120)]],
    lastName: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
    password: [''],
  });

  constructor() {
    void this.bootstrap();
  }

  private async bootstrap(): Promise<void> {
    try {
      const [read, add, update, del, claims] = await Promise.all([
        this.authz.canReadUsers(),
        this.authz.canAddUsers(),
        this.authz.canUpdateUsers(),
        this.authz.canDeleteUsers(),
        this.authz.canManageUserClaims(),
      ]);
      this.canRead.set(read);
      this.canAdd.set(add);
      this.canUpdate.set(update);
      this.canDelete.set(del);
      this.canManageClaims.set(claims);
    } catch {
      this.toast.error('Could not resolve permissions.');
    } finally {
      this.permissionsLoaded.set(true);
    }
    if (this.canRead()) {
      await this.loadPage();
    }
  }

  protected onSearchInputEvent(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected onClaimsSearchInput(ev: Event): void {
    this.claimsSearchQuery.set((ev.target as HTMLInputElement).value);
  }

  protected async loadPage(): Promise<void> {
    if (!this.canRead()) {
      return;
    }
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.api.getUsers(this.pageIndex(), this.pageSize())
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
      const message = e instanceof Error ? e.message : 'Could not load users.';
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

  protected displayName(u: User): string {
    return `${u.firstName} ${u.lastName}`.trim();
  }

  protected isClaimSelected(id: number): boolean {
    return this.claimsSelectedIds().includes(id);
  }

  protected toggleClaim(id: number, checked: boolean): void {
    this.claimsSelectedIds.update((ids) => {
      const set = new Set(ids);
      if (checked) {
        set.add(id);
      } else {
        set.delete(id);
      }
      return [...set].sort((a, b) => a - b);
    });
  }

  protected onClaimCheckboxChange(claimId: number, ev: Event): void {
    const checked = (ev.target as HTMLInputElement).checked;
    this.toggleClaim(claimId, checked);
  }

  protected openCreate(): void {
    this.createForm.reset({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
    });
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
      const raw = this.createForm.getRawValue();
      const result = await firstValueFrom(
        this.api.createUser({
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          email: raw.email.trim(),
          password: raw.password,
        })
      );
      if (!this.handleResult(result, 'User created.')) {
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

  protected openEdit(user: User): void {
    this.editingUserId = user.id;
    this.editForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
    });
    this.editForm.markAsPristine();
    this.editDialogRef()?.nativeElement.showModal();
  }

  protected closeEdit(): void {
    this.editingUserId = null;
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
      this.editingUserId = null;
    }
  }

  protected async submitEdit(): Promise<void> {
    const id = this.editingUserId;
    if (id == null || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    const pwd = this.editForm.controls.password.value?.trim() ?? '';
    if (pwd.length > 0 && pwd.length < 6) {
      this.editForm.controls.password.markAsTouched();
      this.toast.error('Password must be at least 6 characters or left blank.');
      return;
    }
    this.editSubmitting.set(true);
    try {
      const raw = this.editForm.getRawValue();
      const result = await firstValueFrom(
        this.api.updateUser(id, {
          id,
          firstName: raw.firstName.trim(),
          lastName: raw.lastName.trim(),
          email: raw.email.trim(),
          password: pwd,
        })
      );
      if (!this.handleResult(result, 'User updated.')) {
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

  protected async openDetail(user: User): Promise<void> {
    this.detailUser.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.api.getUserById(user.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailUser.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load user.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailUser.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }

  protected confirmDelete(user: User): void {
    this.userPendingDelete.set(user);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.userPendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const user = this.userPendingDelete();
    if (!user) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.api.deleteUser(user.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('User deleted.');
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

  protected async openClaims(user: User): Promise<void> {
    if (!this.canManageClaims()) {
      return;
    }
    this.claimsUserId = user.id;
    this.claimsSearchQuery.set('');
    this.claimsAll.set([]);
    this.claimsSelectedIds.set([]);
    this.claimsDialogRef()?.nativeElement.showModal();
    this.claimsLoading.set(true);
    try {
      const [allClaims, userClaimsResult] = await Promise.all([
        this.fetchAllOperationClaims(),
        firstValueFrom(this.auth.getUserOperationClaimsByUserId(user.id)),
      ]);
      this.claimsAll.set(allClaims);
      if (!userClaimsResult.isOk) {
        this.toast.error(userClaimsResult.error.message);
        this.claimsDialogRef()?.nativeElement.close();
        return;
      }
      const rows = this.normalizeUserClaimRows(userClaimsResult.value);
      this.claimsSelectedIds.set(
        rows.map((r) => r.operationClaimId).filter((id) => Number.isFinite(id))
      );
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load permissions.');
      this.claimsDialogRef()?.nativeElement.close();
    } finally {
      this.claimsLoading.set(false);
    }
  }

  protected closeClaims(): void {
    this.claimsUserId = null;
    this.claimsAll.set([]);
    this.claimsSelectedIds.set([]);
    this.claimsDialogRef()?.nativeElement.close();
  }

  protected onClaimsBackdrop(ev: MouseEvent): void {
    const el = this.claimsDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeClaims();
    }
  }

  protected async saveClaims(): Promise<void> {
    const userId = this.claimsUserId;
    if (userId == null) {
      return;
    }
    this.claimsSaving.set(true);
    try {
      const result = await firstValueFrom(
        this.auth.updateUserOperationClaimsByUserId(userId, this.claimsSelectedIds())
      );
      if (!this.handleResult(result, 'Permissions updated.')) {
        return;
      }
      this.closeClaims();
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Save failed.');
    } finally {
      this.claimsSaving.set(false);
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
      const page = result.value as Page<OperationClaim>;
      const items = page?.items ?? [];
      out.push(...items);
      if (!page?.hasNext) {
        break;
      }
      pageIndex += 1;
    }
    return out.sort((a, b) => a.name.localeCompare(b.name));
  }

  private normalizeUserClaimRows(raw: unknown): userOperationClaim[] {
    if (Array.isArray(raw)) {
      return raw as userOperationClaim[];
    }
    if (raw && typeof raw === 'object' && 'items' in raw) {
      const items = (raw as { items?: unknown }).items;
      if (Array.isArray(items)) {
        return items as userOperationClaim[];
      }
    }
    return [];
  }

  protected createFieldError(
    key: 'firstName' | 'lastName' | 'email' | 'password'
  ): string {
    const c = this.createForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (key === 'email' && c.hasError('email')) {
      return 'Enter a valid email address.';
    }
    if (key === 'password' && c.hasError('minlength')) {
      return 'Use at least 6 characters.';
    }
    if (c.hasError('maxLength')) {
      return 'Value is too long.';
    }
    return '';
  }

  protected editFieldError(
    key: 'firstName' | 'lastName' | 'email' | 'password'
  ): string {
    const c = this.editForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (key === 'email' && c.hasError('email')) {
      return 'Enter a valid email address.';
    }
    if (key === 'password' && c.hasError('minlength')) {
      return 'Use at least 6 characters or leave blank.';
    }
    if (c.hasError('maxLength')) {
      return 'Value is too long.';
    }
    return '';
  }

  protected userStatusLabel(u: User): string {
    if (u.status === undefined) {
      return '—';
    }
    return u.status ? 'Active' : 'Inactive';
  }

  protected userStatusOn(u: User): boolean | null {
    if (u.status === undefined) {
      return null;
    }
    return u.status;
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
