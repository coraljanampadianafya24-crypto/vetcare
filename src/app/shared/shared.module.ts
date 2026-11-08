import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AppointmentStatusPipe } from './appointment-status.pipe';
import { UpcomingAppointmentDirective } from './upcoming-appointment.directive';

@NgModule({
  declarations: [AppointmentStatusPipe, UpcomingAppointmentDirective],
  imports: [CommonModule, RouterModule],
  exports: [CommonModule, RouterModule, AppointmentStatusPipe, UpcomingAppointmentDirective]
})
export class SharedModule {}
