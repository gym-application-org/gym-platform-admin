import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

import { EXERCISE_REPOSITORY } from '../../config/repository.tokens';
import { Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../../data/services/api/models/exercise';
import {
  DIFFICULTY_LEVEL_LABELS,
  DifficultyLevel,
} from '../../data/services/api/models/enum-labels';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { AppSelectFieldComponent } from '../../shared/ui/fields/app-select-field.component';
import type { AppSelectOption } from '../../shared/ui/fields/select-option';
import { AppTextFieldComponent } from '../../shared/ui/fields/app-text-field.component';
import { AppTextareaFieldComponent } from '../../shared/ui/fields/app-textarea-field.component';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Result } from '../../utils/result';

function optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
  const v = (control.value as string | null | undefined)?.trim();
  if (!v) {
    return null;
  }
  try {
    void new URL(v);
    return null;
  } catch {
    return { url: true };
  }
}

@Component({
  selector: 'app-exercises-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AppTextFieldComponent,
    AppTextareaFieldComponent,
    AppSelectFieldComponent,
    AppButtonComponent,
  ],
  templateUrl: './exercises-page.component.html',
  styleUrl: './exercises-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesPageComponent {
  private readonly exercisesRepo = inject(EXERCISE_REPOSITORY);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);

  private readonly createDialogRef = viewChild<ElementRef<HTMLDialogElement>>('createDialog');
  private readonly editDialogRef = viewChild<ElementRef<HTMLDialogElement>>('editDialog');
  private readonly detailDialogRef = viewChild<ElementRef<HTMLDialogElement>>('detailDialog');
  private readonly deleteDialogRef = viewChild<ElementRef<HTMLDialogElement>>('deleteDialog');

  protected readonly loading = signal(false);
  protected readonly pageItems = signal<Exercise[]>([]);
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

  protected readonly exercisePendingDelete = signal<Exercise | null>(null);
  protected readonly detailExercise = signal<Exercise | null>(null);

  private editingExerciseId: number | null = null;

  protected readonly difficultyOptions: AppSelectOption[] = [
    { value: String(DifficultyLevel.Beginner), label: DIFFICULTY_LEVEL_LABELS[DifficultyLevel.Beginner] },
    {
      value: String(DifficultyLevel.Intermediate),
      label: DIFFICULTY_LEVEL_LABELS[DifficultyLevel.Intermediate],
    },
    { value: String(DifficultyLevel.Advanced), label: DIFFICULTY_LEVEL_LABELS[DifficultyLevel.Advanced] },
  ];

  protected readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const items = this.pageItems();
    if (!q) {
      return items;
    }
    return items.filter((ex) => {
      return (
        ex.name.toLowerCase().includes(q) ||
        ex.muscleGroup.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q) ||
        ex.description.toLowerCase().includes(q)
      );
    });
  });

  protected readonly createForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    muscleGroup: ['', [Validators.required, Validators.maxLength(120)]],
    equipment: ['', [Validators.required, Validators.maxLength(120)]],
    difficultyLevel: [String(DifficultyLevel.Beginner), [Validators.required]],
    videoUrl: ['', [optionalUrlValidator]],
    thumbnailUrl: ['', [optionalUrlValidator]],
    isActive: [true],
  });

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
    muscleGroup: ['', [Validators.required, Validators.maxLength(120)]],
    equipment: ['', [Validators.required, Validators.maxLength(120)]],
    difficultyLevel: [String(DifficultyLevel.Beginner), [Validators.required]],
    videoUrl: ['', [optionalUrlValidator]],
    thumbnailUrl: ['', [optionalUrlValidator]],
    isActive: [true],
  });

  constructor() {
    void this.loadPage();
  }

  protected difficultyLabel(level: DifficultyLevel): string {
    return DIFFICULTY_LEVEL_LABELS[level] ?? String(level);
  }

  protected difficultyModifier(level: DifficultyLevel): 'beginner' | 'intermediate' | 'advanced' | 'unknown' {
    if (level === DifficultyLevel.Beginner) return 'beginner';
    if (level === DifficultyLevel.Intermediate) return 'intermediate';
    if (level === DifficultyLevel.Advanced) return 'advanced';
    return 'unknown';
  }

  protected onSearchInputEvent(ev: Event): void {
    const v = (ev.target as HTMLInputElement).value;
    this.searchQuery.set(v);
  }

  protected async loadPage(): Promise<void> {
    this.loading.set(true);
    try {
      const result = await firstValueFrom(
        this.exercisesRepo.getExercises(this.pageIndex(), this.pageSize())
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
      const message = e instanceof Error ? e.message : 'Could not load exercises.';
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
      name: '',
      description: '',
      muscleGroup: '',
      equipment: '',
      difficultyLevel: String(DifficultyLevel.Beginner),
      videoUrl: '',
      thumbnailUrl: '',
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
      const body: CreateExerciseRequest = {
        name: raw.name.trim(),
        description: raw.description.trim(),
        muscleGroup: raw.muscleGroup.trim(),
        equipment: raw.equipment.trim(),
        difficultyLevel: Number(raw.difficultyLevel) as DifficultyLevel,
        videoUrl: raw.videoUrl.trim(),
        thumbnailUrl: raw.thumbnailUrl.trim(),
        isActive: raw.isActive,
      };
      const result = await firstValueFrom(this.exercisesRepo.createExercise(body));
      if (!this.handleResult(result, 'Exercise created.')) {
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

  protected openEdit(ex: Exercise): void {
    this.editingExerciseId = ex.id;
    this.editForm.patchValue({
      name: ex.name,
      description: ex.description,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      difficultyLevel: String(ex.difficultyLevel),
      videoUrl: ex.videoUrl,
      thumbnailUrl: ex.thumbnailUrl,
      isActive: ex.isActive,
    });
    this.editForm.markAsPristine();
    this.editDialogRef()?.nativeElement.showModal();
  }

  protected closeEdit(): void {
    this.editingExerciseId = null;
    this.editDialogRef()?.nativeElement.close();
  }

  protected onEditBackdrop(ev: MouseEvent): void {
    const el = this.editDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      el.close();
      this.editingExerciseId = null;
    }
  }

  protected async submitEdit(): Promise<void> {
    if (!this.editingExerciseId || this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      return;
    }
    this.editSubmitting.set(true);
    try {
      const raw = this.editForm.getRawValue();
      const id = this.editingExerciseId;
      const body: UpdateExerciseRequest = {
        id,
        name: raw.name.trim(),
        description: raw.description.trim(),
        muscleGroup: raw.muscleGroup.trim(),
        equipment: raw.equipment.trim(),
        difficultyLevel: Number(raw.difficultyLevel) as DifficultyLevel,
        videoUrl: raw.videoUrl.trim(),
        thumbnailUrl: raw.thumbnailUrl.trim(),
        isActive: raw.isActive,
      };
      const result = await firstValueFrom(this.exercisesRepo.updateExercise(id, body));
      if (!this.handleResult(result, 'Exercise updated.')) {
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

  protected openDetail(ex: Exercise): void {
    this.detailExercise.set(ex);
    this.detailDialogRef()?.nativeElement.showModal();
  }

  protected closeDetail(): void {
    this.detailExercise.set(null);
    this.detailDialogRef()?.nativeElement.close();
  }

  protected onDetailBackdrop(ev: MouseEvent): void {
    const el = this.detailDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDetail();
    }
  }

  protected confirmDelete(ex: Exercise): void {
    this.exercisePendingDelete.set(ex);
    this.deleteDialogRef()?.nativeElement.showModal();
  }

  protected closeDelete(): void {
    this.exercisePendingDelete.set(null);
    this.deleteDialogRef()?.nativeElement.close();
  }

  protected onDeleteBackdrop(ev: MouseEvent): void {
    const el = this.deleteDialogRef()?.nativeElement;
    if (el && ev.target === el) {
      this.closeDelete();
    }
  }

  protected async submitDelete(): Promise<void> {
    const ex = this.exercisePendingDelete();
    if (!ex) {
      return;
    }
    this.deleteSubmitting.set(true);
    try {
      const result = await firstValueFrom(this.exercisesRepo.deleteExercise(ex.id));
      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }
      this.toast.success('Exercise deleted.');
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

  protected createFieldError(
    key:
      | 'name'
      | 'description'
      | 'muscleGroup'
      | 'equipment'
      | 'videoUrl'
      | 'thumbnailUrl'
  ): string {
    const c = this.createForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (c.hasError('maxLength')) {
      return 'Value is too long.';
    }
    if (c.hasError('url')) {
      return 'Enter a valid URL or leave empty.';
    }
    return '';
  }

  protected createDifficultyError(): string {
    const c = this.createForm.controls.difficultyLevel;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Select a difficulty level.';
    }
    return '';
  }

  protected editDifficultyError(): string {
    const c = this.editForm.controls.difficultyLevel;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Select a difficulty level.';
    }
    return '';
  }

  protected editFieldError(
    key: 'name' | 'description' | 'muscleGroup' | 'equipment' | 'videoUrl' | 'thumbnailUrl'
  ): string {
    const c = this.editForm.controls[key];
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'This field is required.';
    }
    if (c.hasError('maxLength')) {
      return 'Value is too long.';
    }
    if (c.hasError('url')) {
      return 'Enter a valid URL or leave empty.';
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
