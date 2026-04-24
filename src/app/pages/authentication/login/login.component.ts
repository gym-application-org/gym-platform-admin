import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AUTH_REPOSITORY } from '../../../config/repository.tokens';
import { LocalStorageService } from '../../../data/services/local-storage-service';
import { AuthorizationService } from '../../../services/authorization.service';
import { AppButtonComponent } from '../../../shared/ui/button/app-button.component';
import { AppTextFieldComponent } from '../../../shared/ui/fields/app-text-field.component';
import { ToastService } from '../../../shared/ui/toast/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, AppTextFieldComponent, AppButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authRepository = inject(AUTH_REPOSITORY);
  private readonly authorization = inject(AuthorizationService);
  private readonly toast = inject(ToastService);
  private readonly localStorage = inject(LocalStorageService);

  protected readonly loading = signal(false);
  protected readonly showPassword = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
    rememberEmail: [true],
  });

  constructor() {
    void this.prefillEmail();
  }

  private async prefillEmail(): Promise<void> {
    const last = await this.localStorage.getLastLoginUser();
    if (last.isOk && last.value) {
      this.form.patchValue({ email: last.value });
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  protected emailError(): string {
    const c = this.form.controls.email;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Email is required.';
    }
    if (c.hasError('email')) {
      return 'Enter a valid email address.';
    }
    return '';
  }

  protected passwordError(): string {
    const c = this.form.controls.password;
    if (!c.touched && !c.dirty) {
      return '';
    }
    if (c.hasError('required')) {
      return 'Password is required.';
    }
    return '';
  }

  protected async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    try {
      const { email, password, rememberEmail } = this.form.getRawValue();
      const result = await firstValueFrom(this.authRepository.login({ email, password }));

      if (!result.isOk) {
        this.toast.error(result.error.message);
        return;
      }

      const isAdmin = await this.authorization.isAdmin();
      if (!isAdmin) {
        await this.authRepository.logout();
        this.toast.error(
          'Access denied. This admin portal is only available to users with the Administrator role.'
        );
        return;
      }

      if (rememberEmail) {
        await this.localStorage.setLastLoginUser(email);
      } else {
        await this.localStorage.setLastLoginUser(null);
      }

      this.toast.success('Signed in successfully.');
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
      const safe =
        returnUrl && returnUrl.startsWith('/') && !returnUrl.startsWith('//')
          ? returnUrl
          : '/';
      await this.router.navigateByUrl(safe);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong. Please try again.';
      this.toast.error(message);
    } finally {
      this.loading.set(false);
    }
  }
}
