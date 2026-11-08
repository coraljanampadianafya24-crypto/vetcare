import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface ServiceInfo {
  slug: string; 
  title: string; 
  subtitle: string; 
  purpose: string; 
  includes: string[];
  duration: string; 
  choices: string[]; 
  imageAlt: string;
}

const SERVICE_INFO: ServiceInfo[] = [
  { slug:'consulta-general', 
    title:'Consulta general', 
    subtitle:'Una evaluación para conocer el estado de salud de tu mascota.', 
    purpose:'Revisión veterinaria para conversar sobre síntomas y resolver dudas.', 
    includes:['Evaluación física general','Revisión de síntomas','Recomendaciones de cuidado'], 
    duration:'Aprox. 30 min', choices:['Perro','Gato'], 
    imageAlt:'Atención veterinaria en VetCare' },
  { slug:'vacunacion', 
    title:'Vacunación', 
    subtitle:'Protección preventiva según la etapa de vida de tu mascota.', 
    purpose:'Revisa con el equipo veterinario qué vacuna corresponde y cuándo aplicarla.', 
    includes:['Revisión previa','Registro de la atención','Orientación sobre vacunas'], 
    duration:'Aprox. 20 min', choices:['Perro','Gato'], 
    imageAlt:'Consulta de vacunación veterinaria' },
  { slug:'desparasitacion', 
    title:'Desparasitación', 
    subtitle:'Cuidado preventivo para perros y gatos.', 
    purpose:'El equipo veterinario orienta el cuidado según la especie y las características de tu mascota.', 
    includes:['Evaluación básica','Indicaciones para casa','Orientación según la mascota'], 
    duration:'Aprox. 20 min', choices:['Perro','Gato'], 
    imageAlt:'Atención preventiva de mascotas' },
  { slug:'bano-cuidado', 
    title:'Baño y cuidado', 
    subtitle:'Higiene y cuidado para que tu mascota se sienta bien.', 
    purpose:'Una sesión de higiene adaptada al tamaño, tipo de pelaje y necesidades de tu mascota.', 
    includes:['Baño según tipo de pelaje','Secado y cepillado','Revisión visual de piel'], 
    duration:'Varía según tamaño', choices:['Tamaño pequeño','Tamaño mediano','Tamaño grande'], 
    imageAlt:'Cuidado e higiene de mascotas' }
];

@Component({
  selector: 'vc-service-detail',
  template: `
    <header class="public-nav">
      <a class="public-brand" routerLink="/">
        <img src="assets/images/logo-vetcare.png" alt="VetCare">
      </a>
      <nav aria-label="Navegación principal">
        <a routerLink="/">Inicio</a>
        <a class="active" routerLink="/" fragment="servicios">Servicios</a>
        <a routerLink="/" fragment="nosotros">Nosotros</a>
        <a routerLink="/" fragment="contacto">Contacto</a>
      </nav>
      <div class="public-actions" *ngIf="!auth.isAuthenticated(); else signedIn">
        <a routerLink="/acceso">Iniciar sesión</a><a class="register-link" [routerLink]="['/acceso']" [queryParams]="{mode:'register'}">Registrarse</a>
      </div>
      <ng-template #signedIn>
        <a class="register-link" routerLink="/app">Ir a mi panel</a>
      </ng-template>
    </header>
    <main class="service-detail-page" *ngIf="service as item">
      <div class="service-breadcrumb">
        <a routerLink="/">Inicio</a>
        <span>></span>
        <a routerLink="/" fragment="servicios">Servicios</a>
        <span>></span>
        <strong>{{ item.title }}</strong>
      </div>
      <div class="service-heading">
        <span>SERVICIOS VETCARE</span>
        <h1>{{ item.title }}</h1>
        <p>{{ item.subtitle }}</p>
      </div>
      <section class="detail-hero">
        <div class="detail-info">
          <div class="detail-icon">
            {{ item.title === 'Vacunación' ? '⚕' : item.title === 'Baño y cuidado' ? '♧' : item.title === 'Desparasitación' ? '⟲' : '✚' }}
          </div>
          <h2>¿Para qué sirve?</h2>
          <p>{{ item.purpose }}</p>
          <h3>¿Qué incluye?</h3>
          <ul>
            <li *ngFor="let point of item.includes">{{ point }}</li>
          </ul>
        </div>
        <img src="assets/images/clinica-vetcare.png" [alt]="item.imageAlt">
      </section>
      <section class="detail-options">
        <article>
          <span>Duración estimada</span>
          <strong>{{ item.duration }}</strong>
        </article>
        <article class="choice-card">
          <span>Elige una opción</span>
          <div class="choice-buttons">
            <button *ngFor="let choice of item.choices" [class.selected]="selectedChoice === choice" (click)="selectedChoice = choice">{{ choice }}</button>
          </div>
        </article>
        <article>
          <span>Precio</span>
          <strong>Consultar tarifa</strong>
          <small>La clínica confirma el costo antes de la atención.</small>
        </article>
        <button class="detail-cta" (click)="book()">{{ auth.isAuthenticated() ? 'Elegir fecha y hora' : 'Solicitar cita' }} 
          <span>→</span>
        </button>
      </section>
      <div class="detail-note">Puedes consultar la tarifa con la clínica antes de confirmar la cita
        <a routerLink="/" fragment="servicios">Volver a servicios</a>
      </div>
    </main>
    <footer class="public-footer">
      <span>VetCare · Cuidado veterinario cercano</span>
      <a routerLink="/">Volver al inicio</a>
    </footer>
  `
})
export class ServiceDetailComponent implements OnInit {
  service?: ServiceInfo;
  selectedChoice = '';
  constructor(
    private readonly route: ActivatedRoute, 
    private readonly router: Router, 
    readonly auth: AuthService
  ) {}
  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.service = SERVICE_INFO.find(item => item.slug === params.get('slug'));
      if (!this.service) void this.router.navigateByUrl('/');
      this.selectedChoice = this.service?.choices[0] ?? '';
    });
  }
  book(): void {
    if (!this.service) return;
    const queryParams = { 
      returnUrl: '/app/citas', 
      service: this.service.title, 
      option: this.selectedChoice 
    };
    if (this.auth.isAuthenticated()) void this.router.navigate(['/app/citas'], { 
      queryParams: { 
        service: queryParams.service, 
        option: queryParams.option 
      } 
    });
    else void this.router.navigate(['/acceso'], { queryParams });
  }
}
