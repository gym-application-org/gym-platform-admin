import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { StatusPageComponent } from '../../shared/ui/status-page/status-page.component';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [StatusPageComponent, AppButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  protected goHome(): void {
    void this.router.navigateByUrl('/');
  }
}
