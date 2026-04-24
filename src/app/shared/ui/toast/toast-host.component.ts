import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  templateUrl: './toast-host.component.html',
  styleUrl: './toast-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastHostComponent {
  protected readonly toast = inject(ToastService);
}
