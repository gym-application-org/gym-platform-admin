import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ExercisesPageComponent } from './exercises-page.component';

const routes: Routes = [
  {
    path: '',
    component: ExercisesPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ExercisesPageComponent],
})
export class ExercisesModule {}
