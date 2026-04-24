import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-status-page',
  standalone: true,
  templateUrl: './status-page.component.html',
  styleUrl: './status-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusPageComponent {
  /** Optional large status code (e.g. 404, 403) shown GitHub-style. */
  code = input<string>();
  title = input.required<string>();
  description = input.required<string>();
  actionsAriaLabel = input<string>('Next steps');
}
