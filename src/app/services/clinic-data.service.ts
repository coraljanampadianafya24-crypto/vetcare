import { Injectable } from '@angular/core';
import { Appointment, AppointmentFormValue, AppointmentStatus, MedicalRecord, MedicalRecordFormValue, Owner, Pet, PetFormValue } from '../models/clinic.models';
import { AuthService } from './auth.service';

const STORAGE_KEY = 'vetcare-clinic-data-v1';

interface ClinicStore {
  pets: Pet[];
  appointments: Appointment[];
  records: MedicalRecord[];
}

@Injectable({ providedIn: 'root' })
export class ClinicDataService {
  private readonly store: ClinicStore;

  constructor(private readonly auth: AuthService) {
    this.store = this.readStore();
  }

  getPets(): Pet[] {
    const pets = this.auth.isAdmin ? this.store.pets : this.store.pets.filter(pet => pet.owner.email.toLocaleLowerCase('es') === this.auth.currentUser?.email.toLocaleLowerCase('es'));
    return [...pets].sort((a, b) => a.name.localeCompare(b.name));
  }
  getAppointments(): Appointment[] {
    const visiblePetIds = new Set(this.getPets().map(pet => pet.id));
    return this.store.appointments.filter(item => this.auth.isAdmin || visiblePetIds.has(item.petId)).sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }
  getRecordsForPet(petId: string): MedicalRecord[] {
    if (!this.getPets().some(pet => pet.id === petId)) return [];
    return this.store.records.filter(record => record.petId === petId).sort((a, b) => b.date.localeCompare(a.date));
  }
  getPet(petId: string): Pet | undefined { return this.getPets().find(pet => pet.id === petId); }
  getAppointmentCountFor(status?: AppointmentStatus): number {
    return this.getAppointments().filter(item => !status || item.status === status).length;
  }

  registerPet(value: PetFormValue): Pet {
    const user = this.auth.currentUser;
    const owner: Owner = this.auth.isClient && user
      ? { id: user.id, 
        fullName: user.fullName, 
        phone: user.phone, 
        email: user.email }
      : { id: this.createId('owner'), 
        fullName: value.ownerName.trim(), 
        phone: value.ownerPhone.trim(), 
        email: value.ownerEmail.trim() };
    const pet: Pet = {
      id: this.createId('pet'), 
      name: value.name.trim(), 
      species: value.species, 
      breed: value.breed.trim(),
      age: Number(value.age), 
      sex: value.sex, 
      owner, 
      createdAt: new Date().toISOString()
    };
    this.store.pets.push(pet);
    this.persist();
    return pet;
  }

  bookAppointment(value: AppointmentFormValue): { 
    ok: true; 
    appointment: Appointment } | { 
      ok: false; 
      message: string 
    } {
    if (!this.getPets().some(pet => pet.id === value.petId)) return { 
      ok: false, 
      message: 'No puedes reservar una cita para una mascota que no pertenece a tu cuenta.' 
    };
    const today = this.localDate(new Date());
    const currentTime = this.localTime(new Date());
    if (value.date < today || (value.date === today && value.time <= currentTime)) {
      return { 
        ok: false, 
        message: 'Elige una fecha y hora futuras para la cita.' 
      };
    }
    const occupied = this.store.appointments.some(item => item.date === value.date && item.time === value.time && item.status !== 'Cancelada');
    if (occupied) return { 
      ok: false, 
      message: 'Ese horario ya está reservado. Elige otro.' 
    };
    const appointment: Appointment = {
      id: this.createId('appointment'), 
      petId: value.petId, 
      date: value.date, 
      time: value.time,
      reason: value.reason.trim(), 
      service: value.service.trim(), 
      serviceOption: value.serviceOption?.trim() || undefined, 
      status: 'Confirmada', 
      createdAt: new Date().toISOString()
    };
    this.store.appointments.push(appointment);
    this.persist();
    return { 
      ok: true, 
      appointment 
    };
  }

  updateAppointmentStatus(id: string, status: AppointmentStatus): void {
    const appointment = this.store.appointments.find(item => item.id === id);
    const allowedPetIds = new Set(this.getPets().map(pet => pet.id));
    if (!appointment || (!this.auth.isAdmin && (!allowedPetIds.has(appointment.petId) || status !== 'Cancelada'))) return;
    this.store.appointments = this.store.appointments.map(item => item.id === id ? { ...item, status } : item);
    this.persist();
  }

  addMedicalRecord(value: MedicalRecordFormValue): MedicalRecord | null {
    if (!this.auth.isAdmin || !this.store.pets.some(pet => pet.id === value.petId)) return null;
    const record: MedicalRecord = {
      id: this.createId('record'), 
      petId: value.petId, 
      date: value.date,
      reason: value.reason.trim(), 
      diagnosis: value.diagnosis.trim(), 
      treatment: value.treatment.trim(),
      veterinarian: value.veterinarian.trim()
    };
    this.store.records.push(record);
    const matchingAppointment = this.store.appointments.find(item => item.petId === value.petId && item.date === value.date && item.status === 'Confirmada');
    if (matchingAppointment) matchingAppointment.status = 'Atendida';
    this.persist();
    return record;
  }

  private readStore(): ClinicStore {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as ClinicStore;
    } catch (error) {
      console.warn('No se pudieron leer los datos guardados de VetCare.', error);
    }
    const initial = this.createInitialData();
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial)); 
    } catch { /* La aplicación sigue funcionando en memoria. */ }
    return initial;
  }

  private persist(): void {
    try { 
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.store)); 
    }
    catch (error) { 
      console.error('No se pudieron guardar los cambios en este navegador.', error); 
    }
  }

  private createId(prefix: string): string { 
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; 
  }

  private createInitialData(): ClinicStore {
    const pets: Pet[] = [
      { 
        id: 'pet-luna', 
        name: 'Luna', 
        species: 'Perro', 
        breed: 'Mestiza', 
        age: 3, 
        sex: 'Hembra', 
        owner: 
        { 
          id: 'owner-1', 
          fullName: 'María Torres', 
          phone: '987 654 321', 
          email: 'maria@email.com' 
        }, 
          createdAt: '2026-10-20T10:00:00.000Z' 
      },
      { 
        id: 'pet-milo', 
        name: 'Milo', 
        species: 'Gato', 
        breed: 'Atigrado', 
        age: 2, 
        sex: 'Macho', 
        owner: 
        { 
          id: 'owner-2', 
          fullName: 'Jorge Rojas', 
          phone: '956 321 789', 
          email: 'jorge@email.com' 
        }, 
          createdAt: '2026-10-22T10:00:00.000Z' 
      },
      { 
        id: 'pet-rocky', 
        name: 'Rocky', 
        species: 'Perro', 
        breed: 'Labrador', 
        age: 5, 
        sex: 'Macho', 
        owner: 
        { 
          id: 'owner-3', 
          fullName: 'Paola Díaz', 
          phone: '999 111 222', 
          email: 'paola@email.com' 
        }, 
        createdAt: '2026-10-25T10:00:00.000Z' 
      }
    ];
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(); dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    const appointments: Appointment[] = [
      { 
        id: 'appt-1', 
        petId: 'pet-luna', 
        date: this.localDate(tomorrow), 
        time: '10:00', 
        reason: 'Control general', 
        status: 'Confirmada', 
        createdAt: new Date().toISOString() 
      },
      { 
        id: 'appt-2', 
        petId: 'pet-milo', 
        date: this.localDate(dayAfterTomorrow), 
        time: '11:30', 
        reason: 'Vacunación', 
        status: 'Pendiente', 
        createdAt: new Date().toISOString() 
      }
    ];
    const records: MedicalRecord[] = [
      { 
        id: 'record-1', 
        petId: 'pet-luna', 
        date: '2026-10-20', 
        reason: 'Control general', 
        diagnosis: 'Buen estado de salud. Peso adecuado.', 
        treatment: 'Desparasitación preventiva.', 
        veterinarian: 'Dra. Valeria Cruz' 
      },
      { 
        id: 'record-2', 
        petId: 'pet-milo', 
        date: '2026-10-22', 
        reason: 'Irritación ocular', 
        diagnosis: 'Conjuntivitis leve.', 
        treatment: 'Gotas oftálmicas por 5 días.', 
        veterinarian: 'Dr. Luis Paredes' 
      },
      { 
        id: 'record-3', 
        petId: 'pet-luna', 
        date: '2026-09-12', 
        reason: 'Vacunación', 
        diagnosis: 'Paciente estable.', 
        treatment: 'Vacuna anual aplicada.', 
        veterinarian: 'Dra. Valeria Cruz' 
      }
    ];
    return { 
      pets, appointments, records 
    };
  }

  private localDate(date: Date): string {
    const year = date.getFullYear(); 
    const month = `${date.getMonth() + 1}`.padStart(2, '0'); 
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private localTime(date: Date): string { 
    return `${`${date.getHours()}`.padStart(2, '0')}:${`${date.getMinutes()}`.padStart(2, '0')}`; 
  }
}
