import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { AppButtonComponent } from '../../shared/ui/button/app-button.component';
import { StatusPageComponent } from '../../shared/ui/status-page/status-page.component';

@Component({
  selector: 'app-sign-in-required',
  standalone: true,
  imports: [StatusPageComponent, AppButtonComponent],
  templateUrl: './sign-in-required.component.html',
  styleUrl: './sign-in-required.component.scss',
})
export class SignInRequiredComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected goToLogin(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigate(
      ['/login'],
      returnUrl ? { queryParams: { returnUrl } } : undefined
    );
  }
}
