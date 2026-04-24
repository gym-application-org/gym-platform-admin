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
  selector: 'app-text-field',
  standalone: true,
  templateUrl: './app-text-field.component.html',
  styleUrl: './app-text-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppTextFieldComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTextFieldComponent implements ControlValueAccessor {
  private static nextId = 0;

  label = input<string>('');
  hint = input<string>('');
  error = input<string>('');
  type = input<'text' | 'email' | 'password' | 'search' | 'tel' | 'url'>('text');
  autocomplete = input<string | null>(null);
  placeholder = input<string>('');
  id = input<string | undefined>(undefined);
  required = input(false);
  disabled = input(false);
  inputMode = input<string | undefined>(undefined);

  private readonly autoId = `app-tf-${AppTextFieldComponent.nextId++}`;
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
    const v = (ev.target as HTMLInputElement).value;
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
