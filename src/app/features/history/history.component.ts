import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { MedicalRecord, MedicalRecordFormValue, Pet } from '../../models/clinic.models';
import { ClinicDataService } from '../../services/clinic-data.service';
import { AuthService } from '../../services/auth.service';

@Component({ template: `
  <section class="page-title-row">
    <div>
      <div class="eyebrow">SEGUIMIENTO</div>
      <h1>Historial médico</h1>
      <p class="muted">Consulta y registra las atenciones de cada paciente</p>
    </div>
  </section>
  <div class="alert alert-success py-2" *ngIf="successMessage" role="status">{{ successMessage }}</div>
  <section class="content-card history-selector">
    <div class="field">
      <label for="historyPet">Selecciona una mascota</label>
      <select id="historyPet" class="form-select" [(ngModel)]="selectedPetId" (ngModelChange)="loadRecords()">
        <option value="">Elige un paciente</option>
        <option *ngFor="let pet of pets" [value]="pet.id">{{ pet.name }} · {{ pet.owner.fullName }}</option>
      </select>
    </div>
    <div class="selected-pet" *ngIf="selectedPet as pet">
      <span class="pet-avatar large">{{ pet.species === 'Gato' ? '🐱' : '🐶' }}</span>
      <div>
        <strong>{{ pet.name }}</strong>
        <span>
          {{ pet.species }} · {{ pet.breed || 'Raza no indicada' }} · {{ pet.age }} {{ pet.age === 1 ? 'año' : 'años' }}
        </span>
      </div>
      <div class="owner-mini">
        <small>RESPONSABLE</small>
        <strong>{{ pet.owner.fullName }}</strong>
        <span>{{ pet.owner.phone }}</span>
      </div>
    </div>
  </section>
  <div class="history-layout" *ngIf="selectedPet; else choosePet">
    <section class="content-card history-records">
      <div class="card-heading">
        <div>
          <h2>Atenciones anteriores</h2>
          <p>{{ records.length }} registros en su historial</p>
        </div>
      </div>
      <div class="record-list" *ngIf="records.length; else emptyRecords">
        <article class="record-item" *ngFor="let record of records">
          <div class="record-date">
            <span>CONSULTA</span>
            <strong>{{ record.date | date:'dd' }}</strong>
            <small>{{ record.date | date:'MMM yyyy' }}</small>
          </div>
          <div class="record-content">
            <div class="record-title">
              <h3>{{ record.reason }}</h3>
              <span>{{ record.date | date:'d MMMM yyyy' }}</span>
            </div><div class="record-detail">
              <strong>Diagnóstico</strong>
              <p>{{ record.diagnosis }}</p>
            </div>
            <div class="record-detail">
              <strong>Tratamiento</strong>
              <p>{{ record.treatment }}</p>
            </div>
            <small class="vet-name">Atendió: {{ record.veterinarian }}</small>
          </div>
        </article>
      </div>
      <ng-template #emptyRecords>
        <div class="empty-state">
          Este paciente aún no tiene atenciones guardadas
        </div>
      </ng-template>
    </section>
    <section class="content-card new-record-card" *ngIf="auth.isAdmin">
      <div class="card-heading">
        <div>
          <h2>Registrar atención</h2>
          <p>Guarda el resultado de una consulta</p>
        </div>
      </div>
      <form [formGroup]="form" (ngSubmit)="saveRecord()" novalidate>
        <div class="field">
          <label for="recordDate">Fecha</label>
          <input id="recordDate" type="date" class="form-control" [max]="today" formControlName="date">
          <small class="field-error" *ngIf="invalid('date')">Selecciona una fecha válida</small>
        </div>
        <div class="field">
          <label for="recordReason">Motivo de consulta *</label>
          <input id="recordReason" class="form-control" formControlName="reason" placeholder="Ej. Control anual">
          <small class="field-error" *ngIf="invalid('reason')">Completa el motivo</small>
        </div>
        <div class="field">
          <label for="diagnosis">Diagnóstico *</label>
          <textarea id="diagnosis" class="form-control" rows="3" formControlName="diagnosis" placeholder="Hallazgos y evaluación"></textarea>
          <small class="field-error" *ngIf="invalid('diagnosis')">Completa el diagnóstico</small>
        </div>
        <div class="field">
          <label for="treatment">Tratamiento indicado *</label>
          <textarea id="treatment" class="form-control" rows="3" formControlName="treatment" placeholder="Medicamentos, cuidados o indicaciones"></textarea>
          <small class="field-error" *ngIf="invalid('treatment')">Completa el tratamiento</small>
        </div>
        <div class="field">
          <label for="veterinarian">Profesional responsable *</label>
          <input id="veterinarian" class="form-control" formControlName="veterinarian" placeholder="Nombre del veterinario">
          <small class="field-error" *ngIf="invalid('veterinarian')">Completa el nombre</small>
        </div>
        <button type="submit" class="btn btn-primary-soft w-100">Guardar en el historial</button>
      </form>
    </section>
  </div>
  <div class="history-client-note" *ngIf="selectedPet && auth.isClient">
    La clínica registra los diagnósticos y tratamientos de tus mascotas. Aquí puedes consultar las atenciones guardadas
  </div>
  <ng-template #choosePet>
    <div class="content-card empty-state">{{ pets.length ? 'Selecciona una mascota para revisar sus atenciones.' : 'Aún no tienes mascotas. Registra una para consultar su historial.' }}</div>
    </ng-template>
` })
export class HistoryComponent {
  pets: Pet[] = [];
  records: MedicalRecord[] = [];
  selectedPetId = '';
  successMessage = '';
  readonly today = this.localDate(new Date());
  readonly form = this.fb.group({ 
    date: [this.today, Validators.required], 
    reason: ['', [Validators.required, Validators.minLength(3)]], 
    diagnosis: ['', [Validators.required, Validators.minLength(3)]], 
    treatment: ['', [Validators.required, Validators.minLength(3)]], 
    veterinarian: ['', [Validators.required, Validators.minLength(3)]] 
  });
  constructor(
    private readonly fb: FormBuilder, 
    private readonly clinic: ClinicDataService, 
    readonly auth: AuthService, route: ActivatedRoute
  ) {
    this.pets = clinic.getPets();
    const requestedPet = route.snapshot.queryParamMap.get('pet');
    if (requestedPet && this.pets.some(pet => pet.id === requestedPet)) this.selectedPetId = requestedPet;
    this.loadRecords();
  }
  get selectedPet(): Pet | undefined { 
    return this.pets.find(pet => pet.id === this.selectedPetId); 
  }
  invalid(field: string): boolean { 
    const control = this.form.get(field); 
    return !!control && control.invalid && (control.touched || control.dirty); 
  }
  loadRecords(): void { 
    this.records = this.selectedPetId ? 
    this.clinic.getRecordsForPet(this.selectedPetId) : []; 
    this.successMessage = ''; 
  }
  saveRecord(): void {
    if (this.form.invalid || !this.selectedPetId) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    const value = { ...this.form.getRawValue(), petId: this.selectedPetId } as MedicalRecordFormValue;
    const added = this.clinic.addMedicalRecord(value);
    if (!added) return;
    this.records = this.clinic.getRecordsForPet(this.selectedPetId);
    this.successMessage = `La atención de ${this.selectedPet?.name ?? 'la mascota'} se agregó al historial.`;
    this.form.reset({ 
      date: this.today, 
      reason: '', 
      diagnosis: '', 
      treatment: '', 
      veterinarian: '' 
    });
  }
  private localDate(date: Date): string { 
    return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`; 
  }
}
