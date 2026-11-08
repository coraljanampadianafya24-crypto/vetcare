import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { Appointment, AppointmentFormValue, AppointmentStatus, Pet } from '../../models/clinic.models';
import { ClinicDataService } from '../../services/clinic-data.service';
import { AuthService } from '../../services/auth.service';

@Component({ template: `
  <section class="page-title-row">
    <div>
      <div class="eyebrow">ORGANIZACIÓN</div>
      <h1>{{ auth.isAdmin ? 'Agenda de citas' : 'Mis citas' }}</h1>
      <p class="muted">{{ auth.isAdmin ? 'Programa atenciones y controla la disponibilidad de horarios.' : 'Reserva una atención para una de tus mascotas.' }}</p>
    </div>
  </section>
  <div class="alert alert-success py-2" *ngIf="successMessage" role="status">{{ successMessage }}</div>
  <div class="alert alert-warning py-2" *ngIf="errorMessage" role="alert">{{ errorMessage }}</div>
  <div class="appointments-layout">
    <section class="content-card booking-card">
      <div class="card-heading">
        <div>
          <h2>Nueva cita</h2>
          <p>Los horarios ocupados no se pueden reservar</p>
        </div>
        <span class="round-icon peach">+</span>
      </div>
      <form [formGroup]="form" (ngSubmit)="book()" novalidate>
        <div class="field">
          <label for="appointmentService">Servicio</label>
          <select id="appointmentService" class="form-select" formControlName="service">
            <option *ngFor="let service of services" [value]="service">{{ service }}</option>
          </select>
        </div>
        <div class="field" *ngIf="form.controls.serviceOption.value">
          <label for="appointmentServiceOption">Opción seleccionada</label>
          <input id="appointmentServiceOption" class="form-control" formControlName="serviceOption" readonly>
        </div>
        <div class="field">
          <label for="appointmentPet">Mascota</label>
          <select id="appointmentPet" class="form-select" formControlName="petId">
            <option value="">Selecciona una mascota</option>
            <option *ngFor="let pet of pets" [value]="pet.id">
              {{ pet.name }} · {{ pet.owner.fullName }}
            </option>
          </select>
          <small class="field-error" *ngIf="invalid('petId')">
            Selecciona la mascota
          </small>
          <small class="field-hint" *ngIf="!pets.length">
            Primero registra una mascota para agendar una cita
          </small>
        </div>
        <div class="field">
          <label for="appointmentDate">Fecha *</label>
          <input id="appointmentDate" class="form-control" type="date" [min]="today" formControlName="date" (change)="refreshAvailableTimes()">
          <small class="field-error" *ngIf="invalid('date')">
            Selecciona una fecha desde hoy
          </small>
        </div>
        <div class="field">
          <label>Horario disponible</label>
          <div class="time-grid">
            <button type="button" *ngFor="let time of times" class="time-option" [class.selected]="form.controls.time.value === time" [disabled]="isOccupied(time)" (click)="selectTime(time)">
              {{ time }}
            </button>
          </div>
          <small class="field-error" *ngIf="invalid('time')">
            Selecciona un horario libre
          </small>
          <small class="field-hint">
            Los horarios deshabilitados ya pasaron o están ocupados
          </small>
        </div>
        <div class="field">
          <label for="reason">Nota para la clínica</label>
          <textarea id="reason" class="form-control" rows="3" formControlName="reason" placeholder="Cuéntanos algo que debamos saber"></textarea>
        </div>
        <button class="btn btn-primary-soft w-100" type="submit" [disabled]="!pets.length">Confirmar cita</button>
      </form>
    </section>
    <section class="content-card agenda-card">
      <div class="card-heading">
        <div>
          <h2>Citas programadas</h2>
          <p>{{ appointments.length }} atenciones registradas</p>
        </div>
        <select class="form-select filter-select" [(ngModel)]="statusFilter" aria-label="Filtrar citas por estado">
          <option value="Todas">Todos los estados</option>
          <option>Pendiente</option>
          <option>Confirmada</option>
          <option>Atendida</option>
          <option>Cancelada</option>
        </select>
      </div>
      <div class="agenda-list" *ngIf="filteredAppointments.length; else noAppointments">
        <article class="agenda-item" *ngFor="let appointment of filteredAppointments" [appUpcomingAppointment]="appointment.date">
        <div class="agenda-date">
          <strong>{{ appointment.date | date:'dd' }}</strong>
          <span>{{ appointment.date | date:'MMM, yyyy' }}</span>
        </div><div class="agenda-details">
          <strong>{{ petName(appointment.petId) }} 
            <span class="status-badge" [ngClass]="statusClass(appointment.status)">{{ appointment.status | appointmentStatus }}</span>
          </strong>
          <span>{{ appointment.service || appointment.reason }}
            <span *ngIf="appointment.serviceOption"> · {{ appointment.serviceOption }}</span>
          </span>
          <small>{{ appointment.date | date:'EEEE, d MMMM' }} · {{ appointment.time }}</small>
        </div>
        <div class="agenda-actions" *ngIf="appointment.status !== 'Cancelada' && appointment.status !== 'Atendida'">
          <button class="action-link" *ngIf="auth.isAdmin && appointment.status === 'Pendiente'" (click)="setStatus(appointment.id, 'Confirmada')">Confirmar</button>
          <button class="action-link danger-link" (click)="setStatus(appointment.id, 'Cancelada')">Cancelar</button>
        </div>
      </article>
    </div>
    <ng-template #noAppointments>
      <div class="empty-state">No hay citas para mostrar. Registra la primera desde el formulario</div>
    </ng-template>
    </section>
  </div>
` })
export class AppointmentsComponent {
  readonly services = ['Consulta general', 'Vacunación', 'Desparasitación', 'Baño y cuidado'];
  readonly times = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '15:00', '15:30', '16:00', '16:30', '17:00'];
  pets: Pet[] = [];
  appointments: Appointment[] = [];
  successMessage = '';
  errorMessage = '';
  statusFilter = 'Todas';
  readonly today = this.localDate(new Date());
  readonly form = this.fb.group({ 
      petId: ['', Validators.required], 
      date: [this.today, Validators.required], 
      time: ['', Validators.required], 
      service: ['Consulta general', Validators.required], 
      serviceOption: [''], reason: [''] 
    });
  private readonly petLookup = new Map<string, string>();
  constructor(private readonly fb: FormBuilder, private readonly clinic: ClinicDataService, readonly auth: AuthService, route: ActivatedRoute) {
    this.refresh();
    const service = route.snapshot.queryParamMap.get('service');
    const option = route.snapshot.queryParamMap.get('option');
    if (service && this.services.includes(service)) this.form.controls.service.setValue(service);
    if (option) this.form.controls.serviceOption.setValue(option);
  }
  get filteredAppointments(): Appointment[] { 
    return this.statusFilter === 'Todas' ? this.appointments : this.appointments.filter(item => item.status === this.statusFilter); 
  }
  invalid(field: string): boolean { 
    const control = this.form.get(field); return !!control && control.invalid && (control.touched || control.dirty);
  }
  refreshAvailableTimes(): void { 
    this.form.controls.time.setValue(''); 
  }
  isOccupied(time: string): boolean {
    const date = this.form.controls.date.value;
    if (!date) return true;
    if (date < this.today || (date === this.today && time <= this.localTime(new Date()))) return true;
    return this.appointments.some(item => item.date === date && item.time === time && item.status !== 'Cancelada');
  }
  selectTime(time: string): void { 
    if (!this.isOccupied(time)) this.form.controls.time.setValue(time); 
  }
  book(): void {
    this.successMessage = ''; this.errorMessage = '';
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const result = this.clinic.bookAppointment(this.form.getRawValue() as AppointmentFormValue);
    if (!result.ok) { this.errorMessage = result.message; this.refresh(); return; }
    this.successMessage = 'La cita quedó reservada y ya aparece en tus citas.';
    this.form.reset({ 
      petId: '', 
      date: this.today, 
      time: '', 
      service: 'Consulta general', 
      serviceOption: '', 
      reason: '' }); this.refresh();
  }
  setStatus(id: string, status: AppointmentStatus): void { 
    this.clinic.updateAppointmentStatus(id, status); this.refresh(); 
  }
  petName(id: string): string { 
    return this.petLookup.get(id) ?? 'Mascota'; 
  }
  statusClass(status: AppointmentStatus): string { 
    return { 
      Pendiente: 'badge-pending', 
      Confirmada: 'badge-confirmed', 
      Atendida: 'badge-done', 
      Cancelada: 'badge-cancelled' 
    }[status]; 
  }
  private refresh(): void { 
    this.pets = this.clinic.getPets(); 
    this.appointments = this.clinic.getAppointments(); 
    this.petLookup.clear(); 
    this.pets.forEach(pet => this.petLookup.set(pet.id, pet.name)); 
  }
  private localDate(date: Date): string { 
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`; 
  }
  private localTime(date: Date): string { 
    return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`; 
  }
}
