import { Injectable, signal } from '@angular/core';

import type { ToastItem, ToastSeverity } from './toast.types';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastItem[]>([]);

  /** Read-only list for the host component. */
  readonly toasts = this._toasts.asReadonly();

  show(message: string, severity: ToastSeverity = 'neutral', durationMs = 5000): void {
    const id = crypto.randomUUID();
    this._toasts.update((list) => [...list, { id, message, severity }]);
    if (durationMs > 0) {
      window.setTimeout(() => this.dismiss(id), durationMs);
    }
  }

  success(message: string, durationMs?: number): void {
    this.show(message, 'success', durationMs ?? 5000);
  }

  error(message: string, durationMs?: number): void {
    this.show(message, 'danger', durationMs ?? 6000);
  }

  warning(message: string, durationMs?: number): void {
    this.show(message, 'attention', durationMs ?? 5000);
  }

  info(message: string, durationMs?: number): void {
    this.show(message, 'accent', durationMs ?? 5000);
  }

  neutral(message: string, durationMs?: number): void {
    this.show(message, 'neutral', durationMs ?? 4000);
  }

  dismiss(id: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }

  clear(): void {
    this._toasts.set([]);
  }
}
