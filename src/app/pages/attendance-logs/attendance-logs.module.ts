import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AttendanceLogsPageComponent } from './attendance-logs-page.component';

const routes: Routes = [
  {
    path: '',
    component: AttendanceLogsPageComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), AttendanceLogsPageComponent],
})
export class AttendanceLogsModule {}
