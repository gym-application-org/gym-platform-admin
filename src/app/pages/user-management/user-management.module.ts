import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { UsersPageComponent } from '../users/users-page.component';
import { OperationClaimsPageComponent } from './operation-claims-page.component';
import { UserManagementShellComponent } from './user-management-shell.component';
import { UserOperationClaimsPageComponent } from './user-operation-claims-page.component';
import { UserRolesReferencePageComponent } from './user-roles-reference-page.component';

const routes: Routes = [
  {
    path: '',
    component: UserManagementShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users' },
      { path: 'users', component: UsersPageComponent },
      { path: 'operation-claims', component: OperationClaimsPageComponent },
      { path: 'user-operation-claims', component: UserOperationClaimsPageComponent },
      { path: 'roles', component: UserRolesReferencePageComponent },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    UserManagementShellComponent,
    UsersPageComponent,
    OperationClaimsPageComponent,
    UserOperationClaimsPageComponent,
    UserRolesReferencePageComponent,
  ],
})
export class UserManagementModule {}
