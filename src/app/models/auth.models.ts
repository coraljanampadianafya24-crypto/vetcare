export type UserRole = 'Administrador' | 'Cliente';

export interface UserSession {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
}

export interface UserAccount extends UserSession {
  salt: string;
  passwordHash: string;
}

export interface RegistrationData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}
