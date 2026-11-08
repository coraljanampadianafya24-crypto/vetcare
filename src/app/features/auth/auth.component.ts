import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({ template: `
  <main class="auth-page">
    <section class="auth-intro">
      <a routerLink="/" class="auth-brand">
        <span class="brand-mark">+</span>
        <span>VetCare
          <small>CLÍNICA VETERINARIA</small>
        </span>
      </a>
      <div class="auth-copy">
        <div class="auth-kicker">CUIDAMOS A QUIENES MÁS QUIERES</div>
        <h1>Una atención organizada empieza aquí.</h1>
        <p>Gestiona las mascotas, citas y atenciones de forma sencilla desde un solo lugar.</p>
        <div class="auth-points">
          <span>✓ Agenda sin cruces de horario</span>
          <span>✓ Historial de cada paciente</span>
          <span>✓ Acceso para clientes y personal</span>
        </div>
      </div>
      <div class="auth-footnote">VetCare · Plataforma de atención veterinaria
      </div>
    </section>
    <section class="auth-panel">
      <div class="auth-card">
        <div class="auth-card-heading">
          <div class="eyebrow">{{ mode === 'login' ? 'BIENVENIDO DE NUEVO' : 'ÚNETE A VETCARE' }}</div>
          <h2>{{ mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta' }}</h2>
          <p>{{ mode === 'login' ? 'Ingresa tus datos para continuar.' : 'Crea tu cuenta para registrar a tu mascota y solicitar citas.' }}</p>
        </div>
      <div class="auth-tabs" role="tablist">
        <button type="button" [class.selected]="mode === 'login'" (click)="setMode('login')">Iniciar sesión</button>
        <button type="button" [class.selected]="mode === 'register'" (click)="setMode('register')">Crear cuenta</button>
      </div>
      <div class="auth-notice success-notice" *ngIf="noticeMessage" role="status">{{ noticeMessage }}</div>
      <div class="auth-notice error-notice" *ngIf="errorMessage" role="alert">{{ errorMessage }}</div>
      <form *ngIf="mode === 'login'" [formGroup]="loginForm" (ngSubmit)="login()" novalidate>
        <div class="field">
          <label for="loginEmail">Correo electrónico</label>
          <input id="loginEmail" class="form-control" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com">
          <small class="field-error" *ngIf="loginInvalid('email')">Ingresa un correo válido</small>
        </div>
        <div class="field">
          <label for="loginPassword">Contraseña</label>
          <input id="loginPassword" class="form-control" type="password" formControlName="password" autocomplete="current-password" placeholder="Tu contraseña">
          <small class="field-error" *ngIf="loginInvalid('password')">Escribe tu contraseña</small>
        </div>
        <button type="submit" class="btn btn-primary-soft auth-submit" [disabled]="busy">{{ busy ? 'Ingresando…' : 'Ingresar' }}</button>
        <p class="auth-switch">¿Aún no tienes cuenta? 
          <button type="button" (click)="setMode('register')">Regístrate</button>
        </p>
      </form>
      <form *ngIf="mode === 'register'" [formGroup]="registerForm" (ngSubmit)="register()" novalidate>
        <div class="field">
          <label for="fullName">Nombre completo</label>
          <input id="fullName" class="form-control" formControlName="fullName" autocomplete="name" placeholder="Nombre y apellidos">
          <small class="field-error" *ngIf="registerInvalid('fullName')">Ingresa al menos 3 caracteres</small>
        </div>
        <div class="auth-form-row">
          <div class="field">
            <label for="registerEmail">Correo electrónico</label>
            <input id="registerEmail" class="form-control" type="email" formControlName="email" autocomplete="email" placeholder="tu@correo.com">
            <small class="field-error" *ngIf="registerInvalid('email')">Revisa el correo</small>
          </div>
          <div class="field">
            <label for="registerPhone">Teléfono</label>
            <input id="registerPhone" class="form-control" formControlName="phone" autocomplete="tel" placeholder="987 654 321">
            <small class="field-error" *ngIf="registerInvalid('phone')">Ingresa un teléfono válido</small>
          </div>
        </div>
        <div class="auth-form-row">
          <div class="field">
            <label for="registerPassword">Contraseña</label>
            <input id="registerPassword" class="form-control" type="password" formControlName="password" autocomplete="new-password" placeholder="Mínimo 8 caracteres">
            <small class="field-error" *ngIf="registerInvalid('password')">Usa al menos 8 caracteres</small>
          </div><div class="field">
            <label for="confirmPassword">Repite la contraseña</label>
            <input id="confirmPassword" class="form-control" type="password" formControlName="confirmPassword" autocomplete="new-password" placeholder="Confirma tu contraseña">
            <small class="field-error" *ngIf="registerInvalid('confirmPassword')">Confirma tu contraseña</small>
          </div>
        </div>
        <button type="submit" class="btn btn-primary-soft auth-submit" [disabled]="busy">{{ busy ? 'Creando cuenta…' : 'Crear cuenta' }}</button>
        <p class="auth-switch">¿Ya tienes cuenta? 
          <button type="button" (click)="setMode('login')">Inicia sesión</button>
        </p>
      </form>
    </div>
  </section>
  </main>
` })
export class AuthComponent implements OnInit {
  mode: 'login' | 'register' = 'login';
  errorMessage = '';
  noticeMessage = '';
  busy = false;
  readonly loginForm = this.fb.nonNullable.group({ 
    email: ['', [Validators.required, Validators.email]], 
    password: ['', Validators.required] 
  });
  readonly registerForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]], 
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{7,18}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]], 
    confirmPassword: ['', Validators.required]
  });

  constructor(
    private readonly fb: FormBuilder, 
    private readonly auth: AuthService, 
    private readonly router: Router, 
    private readonly route: ActivatedRoute) {}

  ngOnInit(): void {
    if (
      this.auth.isAuthenticated()) void 
      this.router.navigateByUrl('/app'
      );
    if (
      this.route.snapshot.queryParamMap.get('mode') === 'register') 
      this.mode = 'register';
    if (
      this.route.snapshot.queryParamMap.get('signedOut') === '1') 
      this.noticeMessage = 'Sesión cerrada correctamente.';
  }

  setMode(mode: 'login' | 'register'): void { 
    this.mode = mode; 
    this.errorMessage = ''; 
    this.noticeMessage = ''; 
  }
  loginInvalid(field: string): boolean { 
    const control = this.loginForm.get(field); 
    return !!control && control.invalid && (control.touched || control.dirty); 
  }
  registerInvalid(field: string): boolean { 
    const control = this.registerForm.get(field); 
    return !!control && control.invalid && (control.touched || control.dirty); 
  }

  async login(): Promise<void> {
    this.errorMessage = ''; 
    this.noticeMessage = '';
    if (this.loginForm.invalid) { 
      this.loginForm.markAllAsTouched(); return; 
    }
    this.busy = true;
    try {
      const { email, password } = this.loginForm.getRawValue();
      if (!await this.auth.login(email, password)) { 
        this.errorMessage = 'El correo o la contraseña no coinciden.'; return; 
      }
      await this.navigateAfterAuth();
    } 
    catch { 
      this.errorMessage = 'No se pudo iniciar sesión en este navegador. Inténtalo nuevamente.'; 
    }
    finally { 
      this.busy = false; 
    }
  }

  private async navigateAfterAuth(): Promise<void> {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app';
    const target = requested.startsWith('/app') ? requested : '/app';
    const service = this.route.snapshot.queryParamMap.get('service');
    const option = this.route.snapshot.queryParamMap.get('option');
    const query = new URLSearchParams();
    if (service) query.set('service', service);
    if (option) query.set('option', option);
    const queryString = query.toString();
    await this.router.navigateByUrl(queryString ? `${target}?${queryString}` : target);
  }

  async register(): Promise<void> {
    this.errorMessage = ''; this.noticeMessage = '';
    if (this.registerForm.invalid) { this.registerForm.markAllAsTouched(); return; }
    const value = this.registerForm.getRawValue();
    if (value.password !== value.confirmPassword) { 
      this.errorMessage = 'Las contraseñas no coinciden.'; 
      return; 
    }
    this.busy = true;
    try {
      const result = await this.auth.register({ 
        fullName: value.fullName, 
        email: value.email, 
        phone: value.phone, 
        password: value.password 
      });
      if (!result.ok) { 
        this.errorMessage = result.message; 
        return; 
      }
      await this.navigateAfterAuth();
    } 
    catch { 
      this.errorMessage = 'No se pudo crear la cuenta. Comprueba que uses un navegador actualizado.'; 
    }
    finally { 
      this.busy = false; 
    }
  }
}
