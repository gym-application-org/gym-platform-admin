import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthorizationService } from '../../services/authorization.service';
import { LocalStorageService } from '../../data/services/local-storage-service';
import { AppButtonComponent } from '../../shared/ui/button/app-button.component';

export interface ShellNavItem {
  label: string;
  path: string;
  /** When true, link is hidden unless `canAccessUsers()` */
  requiresUsersAccess?: boolean;
}

const SHELL_NAV: ShellNavItem[] = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Tenants', path: '/tenants' },
  { label: 'User management', path: '/user-management', requiresUsersAccess: true },
  { label: 'Members', path: '/members' },
  { label: 'Staff', path: '/staff' },
  { label: 'Gates', path: '/gates' },
  { label: 'Exercises', path: '/exercises' },
  { label: 'Attendance', path: '/attendance-logs' },
  { label: 'Support', path: '/support-tickets' },
];

@Component({
  selector: 'app-full',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AppButtonComponent],
  templateUrl: './full.component.html',
  styleUrl: './full.component.scss',
})
export class FullComponent implements OnInit {
  private readonly authz = inject(AuthorizationService);
  private readonly localStorage = inject(LocalStorageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly desktopMq = typeof matchMedia !== 'undefined'
    ? matchMedia('(min-width: 960px)')
    : null;

  protected readonly navOpen = signal(false);
  protected readonly userLabel = signal('…');
  protected readonly roleBadges = signal<string[]>([]);
  protected readonly showUsersNav = signal(true);
  protected readonly logoutLoading = signal(false);

  protected readonly navItems = computed(() => {
    const usersOk = this.showUsersNav();
    return SHELL_NAV.filter((item) => !item.requiresUsersAccess || usersOk);
  });

  ngOnInit(): void {
    void this.hydrateUserContext();

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => this.closeNav());

    if (this.desktopMq) {
      const onMq = () => {
        if (this.desktopMq!.matches) this.closeNav();
        this.syncBodyScrollLock();
      };
      this.desktopMq.addEventListener('change', onMq);
      this.destroyRef.onDestroy(() => this.desktopMq!.removeEventListener('change', onMq));
    }

    this.destroyRef.onDestroy(() => {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = '';
      }
    });
  }

  @HostListener('document:keydown', ['$event'])
  protected onDocumentKeydown(ev: KeyboardEvent): void {
    if (ev.key === 'Escape' && this.navOpen()) {
      this.closeNav();
    }
  }

  protected toggleNav(): void {
    this.navOpen.update((v) => !v);
    this.syncBodyScrollLock();
  }

  protected closeNav(): void {
    this.navOpen.set(false);
    this.syncBodyScrollLock();
  }

  private syncBodyScrollLock(): void {
    if (typeof document === 'undefined') return;
    const desktop = this.desktopMq?.matches ?? false;
    document.body.style.overflow = !desktop && this.navOpen() ? 'hidden' : '';
  }

  protected async onLogout(): Promise<void> {
    if (this.logoutLoading()) return;
    this.logoutLoading.set(true);
    try {
      await this.authz.logout();
    } finally {
      this.logoutLoading.set(false);
    }
  }

  private async hydrateUserContext(): Promise<void> {
    const [name, email, identifier, roles] = await Promise.all([
      this.localStorage.getUserName(),
      this.localStorage.getLastLoginUser(),
      this.localStorage.getIdentifier(),
      this.authz.getUserRoles(),
    ]);

    const display =
      (name.isOk && name.value?.trim()) ||
      (email.isOk && email.value?.trim()) ||
      (identifier.isOk && identifier.value?.trim()) ||
      'Signed in';

    this.userLabel.set(display);
    this.roleBadges.set(roles.length ? roles.slice(0, 3) : []);

    this.showUsersNav.set(await this.authz.canAccessUsers());
  }
}
