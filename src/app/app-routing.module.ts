import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FullComponent } from './layouts/full/full.component';
import { AuthGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { SignInRequiredComponent } from './pages/sign-in-required/sign-in-required.component';
import { UnauthorizedComponent } from './pages/unauthorized/unauthorized.component';
import { signInRequiredGuestGuard } from './guards/sign-in-required.guard';

const routes: Routes = [
  {
    path: '',
    component: FullComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./pages/dashboard/dashboard.module').then((m) => m.DashboardModule),
      },
      {
        path: 'tenants',
        loadChildren: () =>
          import('./pages/tenants/tenants.module').then((m) => m.TenantsModule),
      },
      {
        path: 'members',
        loadChildren: () =>
          import('./pages/members/members.module').then((m) => m.MembersModule),
      },
      {
        path: 'staff',
        loadChildren: () =>
          import('./pages/staff/staff.module').then((m) => m.StaffModule),
      },
      {
        path: 'exercises',
        loadChildren: () =>
          import('./pages/exercises/exercises.module').then((m) => m.ExercisesModule),
      },
      {
        path: 'attendance-logs',
        loadChildren: () =>
          import('./pages/attendance-logs/attendance-logs.module').then(
            (m) => m.AttendanceLogsModule
          ),
      },
      {
        path: 'support-tickets',
        loadComponent: () =>
          import('./pages/support-tickets/support-tickets-page.component').then(
            (m) => m.SupportTicketsPageComponent
          ),
      },
      {
        path: 'gates',
        loadChildren: () =>
          import('./pages/gates/gates.module').then((m) => m.GatesModule),
      },
      {
        path: 'user-management',
        loadChildren: () =>
          import('./pages/user-management/user-management.module').then(
            (m) => m.UserManagementModule
          ),
      },
      {
        path: 'users',
        redirectTo: 'user-management/users',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadChildren: () =>
      import('./pages/authentication/authentication.module').then((m) => m.AuthenticationModule),
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
  },
  {
    path: 'sign-in-required',
    canActivate: [signInRequiredGuestGuard],
    component: SignInRequiredComponent,
  },
  {
    path: 'not-found',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '/not-found',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
    FullComponent,
    NotFoundComponent,
    SignInRequiredComponent,
    UnauthorizedComponent,
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
