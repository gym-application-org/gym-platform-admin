import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Role strings referenced by this admin app’s authorization helpers (not exhaustive). */
const ROLE_REFERENCE: { role: string; note: string }[] = [
  { role: 'Admin', note: 'Full platform access in this UI (Admin route guard).' },
  { role: 'users.admin', note: 'User module administration.' },
  { role: 'users.read', note: 'List and view users.' },
  { role: 'users.add', note: 'Create users.' },
  { role: 'users.update', note: 'Edit users and bulk operation claims.' },
  { role: 'users.delete', note: 'Delete users.' },
  { role: 'useroperationclaims.add', note: 'Create user–claim links (with other claims).' },
  { role: 'useroperationclaims.update', note: 'Update assignments.' },
  { role: 'useroperationclaims.delete', note: 'Remove assignments.' },
];

@Component({
  selector: 'app-user-roles-reference-page',
  standalone: true,
  templateUrl: './user-roles-reference-page.component.html',
  styleUrl: './user-roles-reference-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserRolesReferencePageComponent {
  protected readonly roles = ROLE_REFERENCE;
}
