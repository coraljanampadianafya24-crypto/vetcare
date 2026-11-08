import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'vc-public-home',
  template: `
    <header class="public-nav">
      <a class="public-brand" routerLink="/" aria-label="VetCare inicio">
        <img src="assets/images/logo-vetcare.png" alt="VetCare, clínica veterinaria">
      </a>
     <nav aria-label="Navegación principal">
  <a href="#inicio">Inicio</a>
  <a href="#servicios">Servicios</a>
  <a href="#nosotros">Nosotros</a>
  <a href="#contacto">Contacto</a>
</nav>
      <div class="public-actions" *ngIf="!auth.isAuthenticated(); else signedIn">
        <a routerLink="/acceso">Iniciar sesión</a>
        <a class="register-link" [routerLink]="['/acceso']" [queryParams]="{mode:'register'}">Registrarse</a>
      </div>
      <ng-template #signedIn>
        <a class="register-link" routerLink="/app">Ir a mi panel</a>
      </ng-template>
    </header>
    <main>
      <section class="public-hero" id="inicio">
        <div class="hero-copy">
          <span class="hero-kicker">CUIDADO CERCANO PARA CADA MASCOTA</span>
          <h1>Cuidado experto para cada etapa de su vida</h1>
          <p>Atención veterinaria integral, cercana y confiable para tu mascota.</p>
          <div class="hero-actions">
            <button class="hero-primary" (click)="reserve()">
              <span>▦</span> Reservar una cita</button>
              <a class="hero-secondary" href="#servicios">Conocer servicios 
                <span>></span>
              </a>
            </div>
          </div>
        <img class="hero-photo" src="assets/images/clinica-vetcare.png" alt="Veterinaria atendiendo a un perro con su familia y un gato">
      </section>
      <section class="trust-strip">
        <div>
          <span class="trust-icon">♧</span>
          <strong>Atención personalizada</strong>
        </div>
        <div>
          <span class="trust-icon">✹</span>
          <strong>Profesionales calificados</strong>
        </div>
        <div>
          <span class="trust-icon">▦</span>
          <strong>Citas organizadas</strong>
        </div>
      </section>
      <section class="public-services" id="servicios">
        <div class="section-title">
          <span>VETCARE · SERVICIOS</span>
          <h2>Nuestros servicios</h2>
        </div>
        <div class="service-cards">
  <a
    class="service-card"
    *ngFor="let item of services"
    [routerLink]="['/servicios', item.slug]"
  >
    <img
      class="service-image"
      [src]="item.image"
      [alt]="item.alt"
      loading="lazy"
    />

    <div class="service-content">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </div>

    <span class="card-arrow">&gt;</span>
  </a>
</div>
      </section>
      <section class="about-section" id="nosotros">
  <div class="about-photo">
    <img
      src="assets/images/clinica-vetcare.png"
      alt="Veterinaria atendiendo a una mascota"
    />
    <span class="about-photo-label">Cuidado cercano para cada mascota</span>
  </div>

  <div class="about-content">
    <span class="about-kicker">CONOCE VETCARE</span>
    <h2>La salud de tu mascota también es parte de tu familia</h2>
    <p>
      VetCare busca facilitar el cuidado veterinario al organizar el registro
      de mascotas, las citas y sus atenciones en un solo lugar.
    </p>

    <div class="about-points">
      <article>
        <span>♡</span>
        <div>
          <h3>Nuestra misión</h3>
          <p>Promover una atención responsable y cercana para las mascotas.</p>
        </div>
      </article>

      <article>
        <span>✦</span>
        <div>
          <h3>Nuestra visión</h3>
          <p>Hacer más sencilla la organización del cuidado veterinario.</p>
        </div>
      </article>

      <article>
        <span>✓</span>
        <div>
          <h3>Nuestros valores</h3>
          <p>Compromiso, respeto y empatía por cada paciente.</p>
        </div>
      </article>
    </div>
  </div>
</section>
    </main>
    <footer id="contacto" class="site-footer">
  <div class="footer-main">
    <div class="footer-about">
      <a class="footer-brand" routerLink="/" aria-label="VetCare, inicio">
  <img
    class="footer-brand-img"
    src="assets/images/logo-vetcare.png"
    alt="Logo de VetCare"
  />
</a>

      <p>
        Cuidamos el bienestar de tu mascota y te ayudamos a organizar
        sus citas y atenciones.
      </p>

      <a class="footer-cta" routerLink="/acceso">
        Reservar una cita <span>→</span>
      </a>
    </div>

    <div class="footer-column">
  <h3>Explora</h3>
  <a href="#inicio">Inicio</a>
  <a href="#servicios">Servicios</a>
  <a href="#nosotros">Nosotros</a>
</div>

    <div class="footer-column">
      <h3>Nuestros servicios</h3>
      <a routerLink="/servicios/consulta-general">Consulta general</a>
      <a routerLink="/servicios/vacunacion">Vacunación</a>
      <a routerLink="/servicios/desparasitacion">Desparasitación</a>
      <a routerLink="/servicios/bano-cuidado">Baño y cuidado</a>
    </div>

    <div class="footer-column footer-contact">
      <h3>Contacto</h3>
      <p>¿Tienes dudas? Regístrate o inicia sesión para solicitar una cita.</p>
      <a routerLink="/acceso">Ingresar a VetCare <span>→</span></a>
    </div>
  </div>

  <div class="footer-bottom">
    <span>© 2026 VetCare. Proyecto académico.</span>
    <a routerLink="/">Volver al inicio ↑</a>
  </div>
</footer>
  `
})
export class PublicHomeComponent {
  readonly services = [
    {
      slug: 'consulta-general',
      title: 'Consulta general',
      description: 'Evaluación integral para cuidar su salud y bienestar.',
      icon: '✚',
      tone: 'green',
      image: 'assets/images/servicios/consulta-general.png',
      alt: 'Veterinaria atendiendo a un perro'
    },
    {
      slug: 'vacunacion',
      title: 'Vacunación',
      description: 'Protección preventiva para tu mascota.',
      icon: '⚕',
      tone: 'blue',
      image: 'assets/images/servicios/vacunacion.png',
      alt: 'Perro recibiendo atención para su vacunación'
    },
    {
      slug: 'desparasitacion',
      title: 'Desparasitación',
      description: 'Prevención y control de parásitos.',
      icon: '⟲',
      tone: 'green',
      image: 'assets/images/servicios/desparasitacion.png',
      alt: 'Veterinaria revisando a una mascota'
    },
    {
      slug: 'bano-cuidado',
      title: 'Baño y cuidado',
      description: 'Higiene y cuidado para su bienestar.',
      icon: '♧',
      tone: 'blue',
      image: 'assets/images/servicios/bano-cuidado.png',
      alt: 'Perro recibiendo un baño y cuidado'
    }
  ];
  constructor(readonly auth: AuthService, private readonly router: Router) { }
  reserve(): void {
    if (this.auth.isAuthenticated()) void this.router.navigate(['/app/citas']);
    else void this.router.navigate(['/acceso'], { queryParams: { returnUrl: '/app/citas' } });
  }
}
