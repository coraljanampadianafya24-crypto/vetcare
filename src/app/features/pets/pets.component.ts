import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Pet, PetFormValue } from '../../models/clinic.models';
import { ClinicDataService } from '../../services/clinic-data.service';
import { AuthService } from '../../services/auth.service';

@Component({ template: `
  <section class="page-title-row">
    <div>
      <div class="eyebrow">PACIENTES</div>
      <h1>{{ auth.isAdmin ? 'Mascotas registradas' : 'Mis mascotas' }}</h1>
      <p class="muted">{{ auth.isAdmin ? 'Administra los pacientes y la información de sus dueños.' : 'Registra y consulta las mascotas de tu cuenta.' }}</p>
    </div>
    <button class="btn btn-primary-soft" (click)="openForm()">+ Registrar mascota</button>
  </section>
  <div class="alert alert-success py-2" *ngIf="successMessage" role="status">{{ successMessage }}</div>
  <section class="content-card">
    <div class="toolbar">
      <div class="search-wrap">
        <span>⌕</span>
        <input class="form-control" type="search" placeholder="Buscar por mascota, dueño o especie..." [(ngModel)]="searchTerm" aria-label="Buscar mascotas"></div>
        <span class="count-label">{{ filteredPets.length }} pacientes</span>
      </div>
    <div class="table-responsive" *ngIf="filteredPets.length; else noPets">
      <table class="table align-middle pet-table">
        <thead>
          <tr>
            <th>MASCOTA</th>
            <th>ESPECIE / RAZA</th>
            <th>EDAD</th>
            <th>PERSONA RESPONSABLE</th>
            <th>CONTACTO</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let pet of filteredPets">
            <td>
              <div class="pet-cell">
                <span class="pet-avatar" [class.cat-avatar]="pet.species === 'Gato'">{{ pet.species === 'Gato' ? '🐱' : '🐶' }}</span>
                <span>
                  <strong>{{ pet.name }}</strong>
                  <small>{{ pet.sex }}</small>
                </span>
              </div>
            </td>
            <td>
              <strong>{{ pet.species }}</strong>
              <small class="table-sub">{{ pet.breed || 'Raza no indicada' }}</small>
            </td>
            <td>{{ pet.age }} {{ pet.age === 1 ? 'año' : 'años' }}</td>
            <td>{{ pet.owner.fullName }}</td>
            <td>
              <strong>{{ pet.owner.phone }}</strong>
              <small class="table-sub">{{ pet.owner.email }}</small>
            </td>
            <td>
              <a class="row-action" [routerLink]="['/app/historial']" [queryParams]="{ pet: pet.id }" [attr.aria-label]="'Ver historial de ' + pet.name">Ver historial →</a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ng-template #noPets>
      <div class="empty-state">No encontramos mascotas con esa búsqueda.</div>
    </ng-template>
  </section>
  <div class="modal-backdrop-custom" *ngIf="showForm" (click)="closeForm()">
    <section class="form-modal" role="dialog" aria-modal="true" aria-labelledby="pet-form-title" (click)="$event.stopPropagation()">
    <div class="modal-heading">
      <div>
        <div class="eyebrow">NUEVO PACIENTE</div>
        <h2 id="pet-form-title">Registrar mascota</h2>
        <p>{{ auth.isAdmin ? 'Completa los datos de la mascota y su dueño.' : 'La mascota quedará asociada a tu cuenta.' }}</p>
      </div>
      <button class="icon-button" (click)="closeForm()" aria-label="Cerrar">x</button>
    </div>
    <form [formGroup]="form" (ngSubmit)="savePet()" novalidate>
      <h3 class="form-section-title">Datos de la mascota</h3>
      <div class="form-grid">
        <div class="field">
          <label for="petName">Nombre *</label>
          <input id="petName" class="form-control" formControlName="name" placeholder="Ej. Luna">
          <small class="field-error" *ngIf="invalid('name')">Ingresa el nombre de la mascota.</small>
        </div>
        <div class="field">
          <label for="species">Especie *</label>
          <select id="species" class="form-select" formControlName="species">
            <option value="">Selecciona</option>
            <option>Perro</option>
            <option>Gato</option>
            <option>Ave</option>
            <option>Otro</option>
          </select>
          <small class="field-error" *ngIf="invalid('species')">Selecciona una especie.</small>
        </div>
        <div class="field">
          <label for="breed">Raza</label>
          <input id="breed" class="form-control" formControlName="breed" placeholder="Ej. Mestiza">
        </div>
        <div class="field">
          <label for="age">Edad en años *</label>
          <input id="age" class="form-control" type="number" min="0" max="40" formControlName="age">
          <small class="field-error" *ngIf="invalid('age')">La edad debe estar entre 0 y 40 años.</small>
        </div>
        <div class="field">
          <label for="sex">Sexo *</label>
          <select id="sex" class="form-select" formControlName="sex">
            <option value="">Selecciona</option>
            <option>Hembra</option>
            <option>Macho</option>
          </select>
        </div>
      </div>
      <ng-container *ngIf="auth.isAdmin; else accountOwner">
        <h3 class="form-section-title owner-title">Datos del dueño</h3>
        <div class="form-grid">
        <div class="field">
          <label for="ownerName">Nombre completo *</label>
          <input id="ownerName" class="form-control" formControlName="ownerName" placeholder="Nombre y apellidos">
          <small class="field-error" *ngIf="invalid('ownerName')">Ingresa el nombre del responsable.</small>
        </div>
        <div class="field">
          <label for="ownerPhone">Teléfono *</label>
          <input id="ownerPhone" class="form-control" formControlName="ownerPhone" placeholder="987 654 321">
          <small class="field-error" *ngIf="invalid('ownerPhone')">Ingresa un teléfono válido.</small>
        </div>
        <div class="field full-field">
          <label for="ownerEmail">Correo electrónico</label>
          <input id="ownerEmail" class="form-control" type="email" formControlName="ownerEmail" placeholder="nombre@correo.com">
          <small class="field-error" *ngIf="invalid('ownerEmail')">Revisa el formato del correo.</small>
        </div>
      </div>
    </ng-container>
    <ng-template #accountOwner>
      <div class="account-owner-note">Responsable de la mascota: 
        <strong>{{ auth.currentUser?.fullName }}</strong>
        <span>{{ auth.currentUser?.email }}</span>
      </div>
    </ng-template>
    <div class="modal-actions">
      <button type="button" class="btn btn-light" (click)="closeForm()">Cancelar</button>
      <button class="btn btn-primary-soft" type="submit">Guardar mascota</button>
    </div>
    </form>
  </section>
  </div>
` })
export class PetsComponent {
  searchTerm = '';
  showForm = false;
  successMessage = '';
  pets: Pet[] = [];
  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]], 
    species: ['', Validators.required], 
    breed: [''],
    age: [0, [Validators.required, Validators.min(0), Validators.max(40)]], 
    sex: ['' as '' | 'Hembra' | 'Macho', Validators.required],
    ownerName: ['', [Validators.required, Validators.minLength(3)]], 
    ownerPhone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,18}$/)]],
    ownerEmail: ['', Validators.email]
  });
  constructor(
    private readonly fb: FormBuilder, 
    private readonly clinic: ClinicDataService, 
    readonly auth: AuthService) { 
      this.refresh(); 
    }
  get filteredPets(): Pet[] {
    const query = this.searchTerm.trim().toLocaleLowerCase('es');
    return this.pets.filter(pet => `${pet.name} ${pet.species} ${pet.breed} ${pet.owner.fullName} ${pet.owner.phone}`.toLocaleLowerCase('es').includes(query));
  }
  openForm(): void {
    this.successMessage = '';
    const user = this.auth.currentUser;
    this.form.reset({ 
      name: '', 
      species: '', 
      breed: '', 
      age: 0, 
      sex: '', 
      ownerName: this.auth.isClient ? user?.fullName ?? '' : '', 
      ownerPhone: this.auth.isClient ? user?.phone ?? '' : '', 
      ownerEmail: this.auth.isClient ? user?.email ?? '' : '' 
    });
    this.showForm = true;
  }
  closeForm(): void { 
    this.showForm = false; 
  }
  invalid(field: string): boolean { 
    const control = this.form.get(field); 
    return !!control && control.invalid && (control.touched || control.dirty); 
  }
  savePet(): void {
    if (this.form.invalid) { 
      this.form.markAllAsTouched(); 
      return; 
    }
    const value = this.form.getRawValue() as PetFormValue;
    this.clinic.registerPet(value); 
    this.refresh(); this.showForm = false; 
    this.successMessage = `${value.name} quedó registrada correctamente.`;
  }
  private refresh(): void { 
    this.pets = this.clinic.getPets(); 
  }
}
