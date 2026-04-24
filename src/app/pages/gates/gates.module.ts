import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GatesPageComponent } from './gates-page.component';

const routes: Routes = [
  {
    path: '',
    component: GatesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), GatesPageComponent],
})
export class GatesModule {}
