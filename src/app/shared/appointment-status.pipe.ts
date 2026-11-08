import { Pipe, PipeTransform } from '@angular/core';
import { AppointmentStatus } from '../models/clinic.models';

@Pipe({ name: 'appointmentStatus' })
export class AppointmentStatusPipe implements PipeTransform {
  transform(status: AppointmentStatus): string {
    const labels: Record<AppointmentStatus, string> = { Pendiente: 'Por confirmar', Confirmada: 'Confirmada', Atendida: 'Atendida', Cancelada: 'Cancelada' };
    return labels[status];
  }
}
