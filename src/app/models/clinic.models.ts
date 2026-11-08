export interface Owner {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  sex: 'Hembra' | 'Macho';
  owner: Owner;
  createdAt: string;
}

export type AppointmentStatus = 'Pendiente' | 'Confirmada' | 'Atendida' | 'Cancelada';

export interface Appointment {
  id: string;
  petId: string;
  date: string;
  time: string;
  reason: string;
  service?: string;
  serviceOption?: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface MedicalRecord {
  id: string;
  petId: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  veterinarian: string;
}

export interface PetFormValue {
  name: string;
  species: string;
  breed: string;
  age: number;
  sex: 'Hembra' | 'Macho';
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
}

export interface AppointmentFormValue {
  petId: string;
  date: string;
  time: string;
  reason: string;
  service: string;
  serviceOption?: string;
}

export interface MedicalRecordFormValue {
  petId: string;
  date: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  veterinarian: string;
}
