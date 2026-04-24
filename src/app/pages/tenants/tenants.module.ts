import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TenantsPageComponent } from './tenants-page.component';

const routes: Routes = [
  {
    path: '',
    component: TenantsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), TenantsPageComponent],
})
export class TenantsModule {}
