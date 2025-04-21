import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeviceFormComponent } from './device-form/device-form.component';
import { DeviceListComponent } from './device-list/device-list.component';

const routes: Routes = [
  { path: '', component: DeviceListComponent },
  { path: 'create', component: DeviceFormComponent },
  { path: ':id/edit', component: DeviceFormComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DevicesRoutingModule {}
