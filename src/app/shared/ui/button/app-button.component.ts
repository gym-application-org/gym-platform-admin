import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export type AppButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './app-button.component.html',
  styleUrl: './app-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppButtonComponent {
  variant = input<AppButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  loading = input(false);

  clicked = output<MouseEvent>();

  protected onClick(ev: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }
    this.clicked.emit(ev);
  }
}
