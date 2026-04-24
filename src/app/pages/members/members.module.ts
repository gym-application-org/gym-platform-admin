import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembersPageComponent } from './members-page.component';

const routes: Routes = [
  {
    path: '',
    component: MembersPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), MembersPageComponent],
})
export class MembersModule {}
