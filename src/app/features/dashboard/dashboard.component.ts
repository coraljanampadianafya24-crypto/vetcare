import { Component } from '@angular/core';
import { Appointment, Pet } from '../../models/clinic.models';
import { ClinicDataService } from '../../services/clinic-data.service';
import { AuthService } from '../../services/auth.service';

@Component({ template: `
  <section class="welcome-row">
    <div>
      <div class="eyebrow">{{ auth.isAdmin ? 'PÁGINA PRINCIPAL · ADMINISTRACIÓN' : 'PÁGINA PRINCIPAL' }}</div>
      <h1>{{ auth.isAdmin ? 'Bienvenido, administrador' : 'Hola, ' + (auth.currentUser?.fullName || 'cliente') }} 
        <span class="wave">✦</span>
      </h1><p class="muted">{{ auth.isAdmin ? 'Aquí tienes el resumen de la clínica para hoy.' : 'Desde aquí puedes gestionar a tus mascotas y sus citas.' }}</p>
    </div>
    <a class="btn btn-primary-soft" routerLink="/app/citas">＋ {{ auth.isAdmin ? 'Agendar cita' : 'Reservar cita' }}</a>
  </section>
  <div class="client-welcome-card" *ngIf="auth.isClient && pets.length === 0">
    <span class="client-welcome-icon">🐾</span>
    <div>
      <strong>Empieza registrando a tu mascota</strong>
      <p>Luego podrás reservar una cita y consultar su historial médico.</p>
    </div>
    <a class="btn btn-primary-soft" routerLink="/app/mascotas">Registrar mascota</a>
  </div>
  <section class="stats-grid">
    <article class="stat-card">
      <div class="stat-icon mint">♧</div>
      <div>
        <span class="stat-label">{{ auth.isAdmin ? 'Mascotas registradas' : 'Mis mascotas' }}</span>
        <strong>{{ pets.length }}</strong>
        <small>{{ auth.isAdmin ? 'Pacientes en la clínica' : 'Mascotas de tu cuenta' }}</small>
      </div>
    </article>
    <article class="stat-card">
      <div class="stat-icon peach">▦</div>
      <div>
        <span class="stat-label">{{ auth.isAdmin ? 'Citas de hoy' : 'Mis citas de hoy' }}</span>
        <strong>{{ todayAppointments.length }}</strong>
        <small>{{ pendingToday }} por confirmar</small>
      </div>
    </article>
    <article class="stat-card">
      <div class="stat-icon lilac">◷</div>
      <div>
        <span class="stat-label">Próximas citas</span>
        <strong>{{ upcomingAppointments.length }}</strong>
        <small>En los próximos 7 días</small>
      </div>
    </article>
  </section>
  <div class="dashboard-grid">
    <section class="content-card appointments-card">
      <div class="card-heading"><div>
        <h2>{{ auth.isAdmin ? 'Agenda próxima' : 'Mis próximas citas' }}</h2>
        <p>Revisa las próximas atenciones programadas</p>
      </div>
      <a routerLink="/app/citas" class="text-link">Ver agenda 
        <span>→</span>
      </a>
    </div>
      <div class="appointment-list" *ngIf="upcomingAppointments.length; else emptyAppointments">
        <article class="appointment-row" *ngFor="let appointment of upcomingAppointments | slice:0:5" [appUpcomingAppointment]="appointment.date">
          <div class="date-tile">
            <strong>{{ appointment.date | date:'dd' }}</strong>
            <span>{{ appointment.date | date:'MMM' }}</span>
          </div>
          <div class="appointment-main">
            <strong>{{ petName(appointment.petId) }}</strong>
            <span>{{ appointment.service || appointment.reason }}</span>
          </div>
          <div class="appointment-time">
            <strong>{{ appointment.time }}</strong>
            <span>{{ appointment.status | appointmentStatus }}</span>
          </div>
        </article>
      </div>
      <ng-template #emptyAppointments>
        <div class="empty-state">No hay citas próximas. Agenda una atención para comenzar</div>
      </ng-template>
    </section>
    <section class="content-card quick-card">
      <div class="card-heading">
        <div>
          <h2>Accesos rápidos</h2>
          <p>Continúa con las tareas frecuentes</p>
        </div>
      </div>
      <a class="quick-link" routerLink="/app/mascotas">
        <span class="quick-icon mint">＋</span>
        <span>
          <strong>{{ auth.isAdmin ? 'Registrar mascota' : 'Agregar mascota' }}</strong>
          <small>{{ auth.isAdmin ? 'Agrega un nuevo paciente' : 'Vincúlala a tu cuenta' }}</small>
        </span>
        <b>→</b>
      </a>
      <a class="quick-link" routerLink="/app/citas">
        <span class="quick-icon peach">▦</span>
        <span>
          <strong>{{ auth.isAdmin ? 'Programar una cita' : 'Reservar una cita' }}</strong>
          <small>Elige una fecha y horario</small>
        </span>
        <b>→</b>
      </a>
      <a class="quick-link" routerLink="/app/historial">
        <span class="quick-icon lilac">▤</span>
        <span>
          <strong>Consultar historial</strong>
          <small>Revisa atenciones anteriores</small>
        </span>
        <b>→</b>
      </a>
      <div class="tip-box">
        <span>✦</span>
        <div>
          <strong>Consejo del día</strong>
          <p>{{ auth.isAdmin ? 'Confirma las citas del día para reducir ausencias.' : 'Mantén al día las vacunas y controles de tu mascota.' }}</p>
        </div>
      </div>
    </section>
  </div>
` })
export class DashboardComponent {
  readonly pets: Pet[];
  readonly todayAppointments: Appointment[];
  readonly upcomingAppointments: Appointment[];
  readonly pendingToday: number;
  private readonly petLookup = new Map<string, string>();
  constructor(private readonly clinic: ClinicDataService, readonly auth: AuthService) {
    this.pets = clinic.getPets();
    this.pets.forEach(pet => this.petLookup.set(pet.id, pet.name));
    const today = this.localDate(new Date());
    const end = new Date(); end.setDate(end.getDate() + 7);
    const endDate = this.localDate(end);
    this.todayAppointments = clinic.getAppointments().filter(item => item.date === today && item.status !== 'Cancelada');
    this.pendingToday = this.todayAppointments.filter(item => item.status === 'Pendiente').length;
    const currentTime = `${`${new Date().getHours()}`.padStart(2, '0')}:${`${new Date().getMinutes()}`.padStart(2, '0')}`;
    this.upcomingAppointments = clinic.getAppointments().filter(item => (item.date > today || (item.date === today && item.time >= currentTime)) && item.date <= endDate && item.status !== 'Cancelada');
  }
  petName(id: string): string { 
    return this.petLookup.get(id) ?? 'Mascota'; 
  }
  private localDate(date: Date): string { 
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`; 
  }
}
