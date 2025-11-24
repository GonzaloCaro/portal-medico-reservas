import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Componente de barra de navegación principal
 *
 * Muestra diferentes opciones según el estado de autenticación y rol del usuario.
 * Responsable de:
 * - Mostrar/ocultar elementos según sesión
 * - Manejar el cierre de sesión
 * - Redirigir al usuario según sus permisos
 *
 * @example
 * <!-- Uso básico -->
 * <app-navbar></app-navbar>
 */
@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  /**
   * Datos de la sesión actual del usuario
   * @type {any}
   */
  sesion: any = null;

  /**
   * Lista de usuarios registrados (solo para uso interno)
   * @type {any}
   * @private
   */
  usuarios: any;

  /**
   * Constructor del componente
   * @param auth Servicio de autenticación
   * @param router Servicio de navegación
   */
  constructor(private auth: AuthService, private router: Router) {}

  /**
   * Inicializa el componente y suscribe a cambios de sesión
   */
  ngOnInit(): void {
    this.subscribeToSessionChanges();
    this.loadUsers();
  }

  /**
   * Suscribe a cambios en el estado de autenticación
   * @private
   */
  private subscribeToSessionChanges(): void {
    this.auth.sesion$.subscribe((sesion) => {
      this.sesion = sesion;
      // Debug: Verificar tipo de usuario en consola
      console.log('Usuario es admin:', sesion?.tipo !== 'usuario');
    });
  }

  /**
   * Carga los usuarios desde localStorage
   * @private
   */
  private loadUsers(): void {
    this.usuarios = localStorage.getItem('usuarios');
  }

  /**
   * Obtiene los datos de sesión desde localStorage
   * @returns {any} Datos de la sesión o null si no existe
   */
  getSesion(): any {
    const sesion = localStorage.getItem('sesion');
    return sesion ? JSON.parse(sesion) : null;
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean} True si hay sesión activa, false en caso contrario
   */
  estaLogueado(): boolean {
    const sesion = this.getSesion();
    return sesion?.logueado || false;
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} True si es admin, false si es usuario normal o no hay sesión
   */
  isAdmin(): boolean {
    const sesion = this.getSesion();
    return sesion?.tipo !== 'usuario';
  }

  /**
   * Cierra la sesión actual y redirige al inicio
   */
  cerrarSesion(): void {
    console.log('🔴 Cerrando sesión...');
    this.auth.cerrarSesion();
    this.router.navigate(['/']);
  }
}
