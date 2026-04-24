import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';

@Component({
  selector: 'app-user-management-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './user-management-shell.component.html',
  styleUrl: './user-management-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserManagementShellComponent {
  private readonly authz = inject(AuthorizationService);

  /** Show catalog + assignments tabs (needs user read permission). */
  protected readonly showSecurityTabs = signal(false);

  constructor() {
    void this.init();
  }

  private async init(): Promise<void> {
    this.showSecurityTabs.set(await this.authz.canReadUsers());
  }
}
