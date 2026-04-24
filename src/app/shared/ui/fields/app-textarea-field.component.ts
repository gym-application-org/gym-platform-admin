import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-textarea-field',
  standalone: true,
  templateUrl: './app-textarea-field.component.html',
  styleUrl: './app-textarea-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextareaFieldComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTextareaFieldComponent implements ControlValueAccessor {
  private static nextId = 0;

  label = input<string>('');
  hint = input<string>('');
  error = input<string>('');
  placeholder = input<string>('');
  id = input<string | undefined>(undefined);
  required = input(false);
  disabled = input(false);
  rows = input(4);

  private readonly autoId = `app-ta-${AppTextareaFieldComponent.nextId++}`;
  protected readonly controlId = computed(() => this.id() ?? this.autoId);
  protected readonly errorId = computed(() => `${this.controlId()}-err`);
  protected readonly hintId = computed(() => `${this.controlId()}-hint`);

  protected readonly value = signal('');
  private cvaDisabled = signal(false);

  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected onInput(ev: Event): void {
    const v = (ev.target as HTMLTextAreaElement).value;
    this.value.set(v);
    this.onChange(v);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected describedBy(): string | null {
    const parts: string[] = [];
    if (this.hint()) {
      parts.push(this.hintId());
    }
    if (this.error()) {
      parts.push(this.errorId());
    }
    return parts.length ? parts.join(' ') : null;
  }
}
