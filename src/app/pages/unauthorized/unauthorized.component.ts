import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AuthorizationService } from '../../services/authorization.service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { StatusPageComponent } from '../../shared/ui/status-page/status-page.component';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [StatusPageComponent, AppButtonComponent],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss',
})
export class UnauthorizedComponent {
  private readonly auth = inject(AuthorizationService);
  private readonly router = inject(Router);

  /** null until resolved — avoids flashing the wrong CTA label. */
  protected readonly isAdmin = signal<boolean | null>(null);

  constructor() {
    void this.resolveRole();
  }

  private async resolveRole(): Promise<void> {
    this.isAdmin.set(await this.auth.isAdmin());
  }

  protected async goHome(): Promise<void> {
    const admin = this.isAdmin();
    if (admin) {
      await this.router.navigateByUrl('/');
      return;
    }
    await this.auth.logout();
  }
}
