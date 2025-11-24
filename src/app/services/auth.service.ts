import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Servicio de autenticación que maneja:
 * - Estado de sesión del usuario
 * - Roles y permisos
 * - Registro de nuevos usuarios
 * - Notificación de cambios de estado
 *
 * Utiliza localStorage para persistencia y BehaviorSubject
 * para notificar cambios a los suscriptores.
 *
 * @example
 * // Inyectar en componentes
 * constructor(private auth: AuthService) {}
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  /**
   * Fuente de datos reactiva para el estado de sesión
   * @private
   */
  private sesionSubject = new BehaviorSubject<any>(this.getSesion());

  /**
   * Observable público del estado de sesión
   * @type {Observable<any>}
   */
  sesion$ = this.sesionSubject.asObservable();

  /**
   * Constructor que inicializa el servicio
   * - Crea usuario admin por defecto si no existen usuarios
   */
  constructor() {
    this.initializeDefaultAdmin();
  }

  /**
   * Crea usuario administrador por defecto si no hay usuarios registrados
   * @private
   */
  private initializeDefaultAdmin(): void {
    const usuariosStr = localStorage.getItem('usuarios');
    if (!usuariosStr) {
      const admin = {
        nombre: 'Admin',
        email: 'admin@reservaslab.cl',
        password: 'admin',
        tipo: 'admin',
      };
      localStorage.setItem('usuarios', JSON.stringify([admin]));
    }
  }

  /**
   * Obtiene los datos de sesión actuales
   * @returns {any} Datos de sesión o null si no existe
   */
  getSesion(): any {
    const sesion = localStorage.getItem('sesion');
    return sesion ? JSON.parse(sesion) : null;
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean} True si hay sesión activa
   */
  estaLogueado(): boolean {
    const sesion = this.getSesion();
    return sesion?.logueado || false;
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} True si es admin
   */
  esAdmin(): boolean {
    const sesion = this.getSesion();
    return sesion?.tipo === 'admin';
  }

  /**
   * Cierra la sesión actual
   * - Elimina datos de localStorage
   * - Notifica a los suscriptores
   */
  cerrarSesion(): void {
    localStorage.removeItem('sesion');
    this.sesionSubject.next(null);
  }

  /**
   * Inicia sesión con los datos proporcionados
   * @param {any} sesionData Datos de la sesión
   */
  iniciarSesion(sesionData: any): void {
    localStorage.setItem('sesion', JSON.stringify(sesionData));
    this.sesionSubject.next(sesionData);
  }

  /**
   * Registra un nuevo usuario
   * @param {any} user Datos del nuevo usuario
   * @returns {boolean} True si se registró exitosamente
   * @throws {boolean} False si el usuario ya existe
   */
  addUser(user: any): boolean {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const existe = usuarios.some((u: any) => u.email === user.email);
    if (existe) return false;

    usuarios.push(user);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    return true;
  }
}
