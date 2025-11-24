import { Component } from '@angular/core';

/**
 * Componente principal de la página de inicio
 *
 * Este componente sirve como contenedor principal de la página de inicio de la aplicación.
 * Actúa como layout principal que contiene las secciones clave:
 * - Próximos eventos
 * - Eventos pasados
 * - Información sobre nosotros
 * - Formulario de contacto
 *
 * @example
 * <!-- Uso básico como página principal -->
 * <app-home></app-home>
 *
 * @example
 * <!-- Uso con router-outlet (cuando es necesario) -->
 * <app-home>
 *   <router-outlet></router-outlet>
 * </app-home>
 */
@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  /**
   * Constructor del componente Home
   *
   * @remarks
   * Actualmente no realiza ninguna inyección de dependencias ni inicialización especial.
   * Se mantiene como punto de extensión para futuras funcionalidades.
   */
  constructor() {
    // Constructor vacío reservado para futuras inyecciones de dependencias
  }

  // Nota: El componente actualmente actúa principalmente como contenedor/wrapper
  // para otros componentes hijos. La lógica de negocio reside en los componentes
  // hijos que muestra: card-loader, carousel-images, about-us y contact-us.
}
