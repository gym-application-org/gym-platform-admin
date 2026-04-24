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
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { TENANT_REPOSITORY } from '../../config/repository.tokens';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { AppTextFieldComponent } from '../../shared/ui/fields/app-text-field.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-tenants-page',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, AppTextFieldComponent, AppButtonComponent],
  templateUrl: './tenants-page.component.html',
  styleUrl: './tenants-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TenantsPageComponent {
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly createDialogRef = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly loading = signal(false);
  protected readonly pageItems = signal<Tenant[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  protected readonly searchQuery = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailTenant = signal<Tenant | null>(null);

  protected readonly createSubmitting = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly deleteSubmitting = signal(false);

  protected readonly tenantPendingDelete = signal<Tenant | null>(null);

  private editingTenantId: string | null = null;

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter((t) => {
      return (
        t.name.toLowerCase().includes(q) ||
        t.subdomain.toLowerCase().includes(q) ||
        t.ownerName.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.phone.toLowerCase().includes(q)
      );
    });
  });

  protected readonly createForm = this.fb.nonNullable.group({
    tenantName: ['', [Validators.required, Validators.maxLength(200)]],
    tenantIsActive: [true],
    tenantSubdomain: ['', [Validators.required, Validators.maxLength(120)]],
    ownerName: ['', [Validators.required, Validators.maxLength(200)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.maxLength(40)]],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    isActive: [true],
  });

  constructor() {
    void this.loadPage();
  }

  protected onSearchInputEvent(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.tenantsRepo.getTenants(this.pageIndex(), this.pageSize())
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
      const message = e instanceof Error ? e.message : 'Could not load tenants.';
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

  protected openCreate(): void {
    this.createForm.reset({
      tenantName: '',
      tenantIsActive: true,
      tenantSubdomain: '',
      ownerName: '',
      email: '',
      phone: '',
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
        this.tenantsRepo.createTenant({
          tenantName: raw.tenantName.trim(),
          tenantIsActive: raw.tenantIsActive,
          tenantSubdomain: raw.tenantSubdomain.trim(),
          ownerName: raw.ownerName.trim(),
          email: raw.email.trim(),
          phone: raw.phone.trim(),
        })
      );
      if (!this.handleResult(result, 'Tenant created.')) {
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

  protected openEdit(tenant: Tenant): void {
    this.editingTenantId = tenant.id;
    this.editForm.patchValue({
      name: tenant.name,
      isActive: tenant.isActive,
    });
    this.editForm.markAsPristine();
    this.editDialogRef()?.nativeElement.showModal();
  }

  protected closeEdit(): void {
    this.editingTenantId = null;
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
      this.editingTenantId = null;
    }
  }

  protected async submitEdit(): Promise<void> {
    if (!this.editingTenantId || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editSubmitting.set(true);
    try {
      const { name, isActive } = this.editForm.getRawValue();
      const id = this.editingTenantId;
      const result = await firstValueFrom(
        this.tenantsRepo.updateTenant(id, {
          id,
          name: name.trim(),
          isActive,
        })
      );
      if (!this.handleResult(result, 'Tenant updated.')) {
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

  protected async openDetail(tenant: Tenant): Promise<void> {
    this.detailTenant.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.tenantsRepo.getTenantById(tenant.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailTenant.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load tenant.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailTenant.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }

  protected confirmDelete(tenant: Tenant): void {
    this.tenantPendingDelete.set(tenant);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.tenantPendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const tenant = this.tenantPendingDelete();
    if (!tenant) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.tenantsRepo.deleteTenant(tenant.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Tenant deleted.');
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

  protected createFieldError(key: 'tenantName' | 'tenantSubdomain' | 'ownerName' | 'email' | 'phone'): string {
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
    if (c.hasError('maxLength')) {
      return 'Value is too long.';
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
