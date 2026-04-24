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

import { GATE_REPOSITORY, TENANT_REPOSITORY } from '../../config/repository.tokens';
import { Gate } from '../../data/services/api/models/gate';
import { Tenant } from '../../data/services/api/models/tenant';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { AppTextFieldComponent } from '../../shared/ui/fields/app-text-field.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

@Component({
  selector: 'app-gates-page',
  standalone: true,
  imports: [ReactiveFormsModule, AppTextFieldComponent, AppButtonComponent],
  templateUrl: './gates-page.component.html',
  styleUrl: './gates-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GatesPageComponent {
  private readonly gatesRepo = inject(GATE_REPOSITORY);
  private readonly tenantsRepo = inject(TENANT_REPOSITORY);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly createDialogRef = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly loading = signal(false);
  protected readonly tenantsLoading = signal(false);
  protected readonly pageItems = signal<Gate[]>([]);
  protected readonly tenantsCatalog = signal<Tenant[]>([]);
  protected readonly pageIndex = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly totalCount = signal(0);
  protected readonly totalPages = signal(0);
  protected readonly hasPrevious = signal(false);
  protected readonly hasNext = signal(false);

  /** Empty string = all tenants */
  protected readonly filterTenantId = signal('');

  protected readonly searchQuery = signal('');

  protected readonly detailLoading = signal(false);
  protected readonly detailGate = signal<Gate | null>(null);

  protected readonly createSubmitting = signal(false);
  protected readonly editSubmitting = signal(false);
  protected readonly deleteSubmitting = signal(false);

  protected readonly gatePendingDelete = signal<Gate | null>(null);

  private editingGateId: number | null = null;

  protected readonly tenantNameById = computed(() => {
    const map = new Map<string, string>();
    for (const t of this.tenantsCatalog()) {
      map.set(t.id, t.name);
    }
    return map;
  });

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter((g) => {
      const tName = this.tenantNameById().get(g.tenantId) ?? '';
      return (
        g.name.toLowerCase().includes(q) ||
        g.gateCode.toLowerCase().includes(q) ||
        g.tenantId.toLowerCase().includes(q) ||
        tName.toLowerCase().includes(q)
      );
    });
  });

  protected readonly createForm = this.fb.nonNullable.group({
    tenantId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    gateCode: ['', [Validators.required, Validators.maxLength(120)]],
    isActive: [true],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    tenantId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(200)]],
    gateCode: ['', [Validators.required, Validators.maxLength(120)]],
    isActive: [true],
  });

  constructor() {
    void this.loadTenantsCatalog();
    void this.loadPage();
  }

  protected tenantDisplayName(tenantId: string): string {
    return this.tenantNameById().get(tenantId) ?? tenantId;
  }

  protected onFilterTenantChange(ev: Event): void {
    const v = (ev.target as HTMLSelectElement).value;
    this.filterTenantId.set(v);
    this.pageIndex.set(0);
    void this.loadPage();
  }

  protected onSearchInputEvent(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected async loadTenantsCatalog(): Promise<void> {
    this.tenantsLoading.set(true);
    try {
      const items: Tenant[] = [];
      let pageIndex = 0;
      const pageSize = 100;
      const maxPages = 20;
      while (pageIndex < maxPages) {
        const result = await firstValueFrom(this.tenantsRepo.getTenants(pageIndex, pageSize));
        if (!result.isOk) {
          this.toast.error(result.error.message);
          return;
        }
        const page = result.value;
        items.push(...page.items);
        if (!page.hasNext) {
          break;
        }
        pageIndex += 1;
      }
      this.tenantsCatalog.set(items);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load tenants.');
    } finally {
      this.tenantsLoading.set(false);
    }
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const tid = this.filterTenantId().trim();
      const result = await firstValueFrom(
        this.gatesRepo.getGates({
          pageIndex: this.pageIndex(),
          pageSize: this.pageSize(),
          ...(tid ? { tenantId: tid } : {}),
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
      const message = e instanceof Error ? e.message : 'Could not load gates.';
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
      tenantId: this.filterTenantId().trim() || '',
      name: '',
      gateCode: '',
      isActive: true,
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
        this.gatesRepo.createGate({
          tenantId: raw.tenantId.trim(),
          name: raw.name.trim(),
          gateCode: raw.gateCode.trim(),
          isActive: raw.isActive,
        })
      );
      if (!this.handleResult(result, 'Gate created.')) {
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

  protected openEdit(gate: Gate): void {
    this.editingGateId = gate.id;
    this.editForm.patchValue({
      tenantId: gate.tenantId,
      name: gate.name,
      gateCode: gate.gateCode,
      isActive: gate.isActive,
    });
    this.editForm.markAsPristine();
    this.editDialogRef()?.nativeElement.showModal();
  }

  protected closeEdit(): void {
    this.editingGateId = null;
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
      this.editingGateId = null;
    }
  }

  protected async submitEdit(): Promise<void> {
    if (!this.editingGateId || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editSubmitting.set(true);
    try {
      const raw = this.editForm.getRawValue();
      const id = this.editingGateId;
      const result = await firstValueFrom(
        this.gatesRepo.updateGate(id, {
          id,
          tenantId: raw.tenantId.trim(),
          name: raw.name.trim(),
          gateCode: raw.gateCode.trim(),
          isActive: raw.isActive,
        })
      );
      if (!this.handleResult(result, 'Gate updated.')) {
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

  protected async openDetail(gate: Gate): Promise<void> {
    this.detailGate.set(null);
    this.detailLoading.set(true);
    this.detailDialogRef()?.nativeElement.showModal();
    try {
      const result = await firstValueFrom(this.gatesRepo.getGateById(gate.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        this.detailDialogRef()?.nativeElement.close();
        return;
      }
      this.detailGate.set(result.value);
    } catch (e) {
      this.toast.error(e instanceof Error ? e.message : 'Could not load gate.');
      this.detailDialogRef()?.nativeElement.close();
    } finally {
      this.detailLoading.set(false);
    }
  }

  protected closeDetail(): void {
    this.detailGate.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }

  protected confirmDelete(gate: Gate): void {
    this.gatePendingDelete.set(gate);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.gatePendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const gate = this.gatePendingDelete();
    if (!gate) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.gatesRepo.deleteGate(gate.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Gate deleted.');
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

  protected createFieldError(key: 'name' | 'gateCode'): string {
    const c = this.createForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (c.hasError('maxlength')) {
      return 'Value is too long.';
    }
    return '';
  }

  protected createTenantError(): string {
    const c = this.createForm.controls.tenantId;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Select a tenant.';
    }
    return '';
  }

  protected editFieldError(key: 'name' | 'gateCode'): string {
    const c = this.editForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (c.hasError('maxlength')) {
      return 'Value is too long.';
    }
    return '';
  }

  protected editTenantError(): string {
    const c = this.editForm.controls.tenantId;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Select a tenant.';
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
