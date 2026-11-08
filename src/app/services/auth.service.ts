import { Injectable } from '@angular/core';
import { RegistrationData, UserAccount, UserSession } from '../models/auth.models';

const USERS_KEY = 'vetcare-demo-accounts-v1';
const SESSION_KEY = 'vetcare-demo-session-v1';
const PUBLIC_HOME_MIGRATION_KEY = 'vetcare-public-home-migration-v1';
const ADMIN_EMAIL = 'admin@vetcare.pe';
const ADMIN_PASSWORD = 'VetCare2026!';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor() {
    try {
      if (localStorage.getItem(PUBLIC_HOME_MIGRATION_KEY) === null) {
        if (this.currentUser?.id === 'vetcare-admin') localStorage.removeItem(SESSION_KEY);
        localStorage.setItem(PUBLIC_HOME_MIGRATION_KEY, 'done');
      }
    } catch { /* La portada pública permanece disponible aunque el almacenamiento esté deshabilitado. */ }
  }
  get currentUser(): UserSession | null {
    try {
      const value = localStorage.getItem(SESSION_KEY);
      return value ? JSON.parse(value) as UserSession : null;
    } catch { return null; }
  }

  get isAdmin(): boolean { 
    return this.currentUser?.role === 'Administrador'; 
  }
  get isClient(): boolean { 
    return this.currentUser?.role === 'Cliente'; 
  }
  isAuthenticated(): boolean { 
    return this.currentUser !== null; 
  }

  async login(email: string, password: string): Promise<boolean> {
    if (email.trim().toLocaleLowerCase('es') === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      this.saveSession({ 
        id: 'vetcare-admin', 
        fullName: 'Administrador VetCare', 
        email: ADMIN_EMAIL, phone: '', 
        role: 'Administrador', salt: '', 
        passwordHash: '' 
      });
      return true;
    }
    const account = this.getAccounts().find(item => item.email.toLocaleLowerCase('es') === email.trim().toLocaleLowerCase('es'));
    if (!account) return false;
    const hash = await this.hashPassword(password, account.salt);
    if (hash !== account.passwordHash) return false;
    this.saveSession(account);
    return true;
  }

  async register(data: RegistrationData): Promise<{ ok: boolean; message: string }> {
    const result = await this.createClientAccount(data);
    if (result.ok && result.account) this.saveSession(result.account);
    return { 
      ok: result.ok, 
      message: result.message 
    };
  }

  private async createClientAccount(data: RegistrationData): Promise<{ 
    ok: boolean; 
    message: string; 
    account?: UserAccount 
  }> {
    const email = data.email.trim().toLocaleLowerCase('es');
    const users = this.getAccounts();
    if (email === ADMIN_EMAIL) return { 
      ok: false, 
      message: 'Ese correo está reservado para la cuenta administrativa.' 
    };
    if (users.some(item => item.email.toLocaleLowerCase('es') === email)) {
      return { 
        ok: false, 
        message: 'Ya existe una cuenta con ese correo.' 
      };
    }
    const salt = this.createSalt();
    const account: UserAccount = {
      id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      fullName: data.fullName.trim(), 
      email, 
      phone: data.phone.trim(), 
      role: 'Cliente',
      salt, 
      passwordHash: await this.hashPassword(data.password, salt)
    };
    users.push(account);
    try { 
      localStorage.setItem(USERS_KEY, JSON.stringify(users)); 
    }
    catch { 
      return { 
        ok: false, 
        message: 'No se pudo guardar la cuenta en este navegador.' 
      }; 
    }
    return { 
      ok: true, 
      message: 'La cuenta de cliente fue creada correctamente.', 
      account 
    };
  }

  logout(): void {
    try { 
      localStorage.removeItem(SESSION_KEY); 
    } catch {  }
  }

  private getAccounts(): UserAccount[] {
    try {
      const value = localStorage.getItem(USERS_KEY);
      return value ? JSON.parse(value) as UserAccount[] : [];
    } catch { return []; }
  }

  private saveSession(account: UserAccount): void {
    const session: UserSession = { 
      id: account.id, 
      fullName: account.fullName, 
      email: account.email, 
      phone: account.phone, 
      role: account.role 
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }

  private createSalt(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    const bytes = new TextEncoder().encode(`${salt}:${password}`);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }
}
