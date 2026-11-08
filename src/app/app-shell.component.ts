import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({ selector: 'vc-app-shell', template: `
  <div class="app-shell">
    <aside class="sidebar">
      <a class="brand" routerLink="/app" aria-label="VetCare, página principal">
        <span class="brand-mark">✚</span>
        <span>VetCare
          <small>CLÍNICA VETERINARIA</small>
        </span>
      </a>
      <div class="side-label">MENÚ PRINCIPAL</div>
        <nav class="side-nav" aria-label="Navegación principal">
          <a routerLink="/app" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <span class="nav-icon">⌂</span>
            Página principal
          </a>
          <a routerLink="/app/mascotas" routerLinkActive="active">
            <span class="nav-icon">♧</span>{{ auth.isAdmin ? 'Mascotas' : 'Mis mascotas' }}
          </a>
          <a routerLink="/app/citas" routerLinkActive="active">
            <span class="nav-icon">▦</span>{{ auth.isAdmin ? 'Agenda de citas' : 'Mis citas' }}
          </a>
          <a routerLink="/app/historial" routerLinkActive="active">
            <span class="nav-icon">▤</span>Historial médico
          </a>
        </nav>
        <div class="sidebar-bottom"><div class="clinic-avatar">VC</div>
        <div>
          <strong>Clínica VetCare</strong>
          <small>{{ auth.currentUser?.role }}</small>
        </div>
      </div>
    </aside>
    <main class="main-area">
      <header class="topbar">
        <a class="mobile-brand" routerLink="/app">
          <span class="brand-mark">+</span> VetCare
        </a>
        <div class="topbar-spacer"></div>
        <div class="today-label">{{ todayLabel }}</div>
        <div class="profile-menu-wrap">
          <button class="profile-chip" type="button" (click)="toggleMenu()" [attr.aria-expanded]="profileMenuOpen" aria-label="Abrir menú de cuenta">
            <span class="profile-avatar">{{ initials }}</span>
            <span class="profile-name">{{ auth.currentUser?.fullName }}</span>
            <span class="profile-chevron">⌄</span>
          </button>
          <div class="profile-dropdown" *ngIf="profileMenuOpen">
          <a
         class="profile-settings-link"
         routerLink="/app/perfil"
         (click)="profileMenuOpen = false">
         ⚙ Configurar mi perfil
         </a>
            <div class="profile-dropdown-user">
              <strong>{{ auth.currentUser?.fullName }}</strong>
              <small>{{ auth.currentUser?.role }}</small>
            </div>
            <button type="button" class="logout-button" (click)="logout()">
              <span>↪</span> Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <div class="page-container">
        <router-outlet></router-outlet>
      </div>
      <footer class="app-footer">VetCare · Gestión de atención veterinaria</footer>
    </main>
  </div>
` })
export class AppShellComponent {
  readonly todayLabel = new Intl.DateTimeFormat('es-PE', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(new Date());
  profileMenuOpen = false;
  constructor(readonly auth: AuthService, private readonly router: Router) {}
  get initials(): string {
    return (this.auth.currentUser?.fullName ?? 'VC').split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join('');
  }
  toggleMenu(): void { this.profileMenuOpen = !this.profileMenuOpen; }
  logout(): void {
    this.auth.logout();
    this.profileMenuOpen = false;
    void this.router.navigate(['/acceso'], { queryParams: { signedOut: '1' } });
  }
}
