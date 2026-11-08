import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { UserSession } from '../../models/auth.models';

@Component({
  selector: 'vc-profile',
  template: `
    <section class="profile-page">
      <h1>Configurar mi información</h1>
      <p>Actualiza los datos de tu cuenta de administrador.</p>

      <form (ngSubmit)="save()">
        <label>
          Nombre completo
          <input name="fullName" [(ngModel)]="fullName" required>
        </label>

        <label>
          Correo electrónico
          <input name="email" type="email" [(ngModel)]="email" required>
        </label>

        <label>
          Teléfono
          <input name="phone" [(ngModel)]="phone">
        </label>

        <button type="submit">Guardar cambios</button>
        <p *ngIf="saved">Información guardada.</p>
      </form>
    </section>
  `
})
export class ProfileComponent {
  fullName = this.auth.currentUser?.fullName ?? '';
  email = this.auth.currentUser?.email ?? '';
  phone = this.auth.currentUser?.phone ?? '';
  saved = false;

  constructor(private readonly auth: AuthService) {}

  save(): void {
    const user = this.auth.currentUser;
    if (!user) return;

    const updatedUser: UserSession = {
      ...user,
      fullName: this.fullName.trim(),
      email: this.email.trim(),
      phone: this.phone.trim()
    };

    localStorage.setItem('vetcare-demo-session-v1', JSON.stringify(updatedUser));
    this.saved = true;
  }
}