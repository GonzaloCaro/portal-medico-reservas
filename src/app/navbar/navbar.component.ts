import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

type NavOptions = {
  label: string;
  route: string;
  roles: string[];
  isLoggedIn: boolean;
  onClick?: () => void;
};

const NAV_OPTIONS: NavOptions[] = [
  { label: 'Inicio', route: '/', roles: ['admin', 'laboratorio', 'medico'], isLoggedIn: true },
  { label: 'Pacientes', route: '/pacientes', roles: ['medico', 'admin'], isLoggedIn: true },
  { label: 'Reservas', route: '/reservas', roles: ['medico', 'admin'], isLoggedIn: true },
  {
    label: 'Laboratorios',
    route: '/laboratorios',
    roles: ['laboratorio', 'admin'],
    isLoggedIn: true,
  },
  { label: 'Analisis', route: '/analisis', roles: ['laboratorio', 'admin'], isLoggedIn: true },
  { label: 'Mi Perfil', route: '/perfil', roles: ['admin', 'usuario', 'medico'], isLoggedIn: true },
  { label: 'Iniciar Sesión', route: '/login', roles: [], isLoggedIn: false },
  { label: 'Registro', route: '/registro', roles: [], isLoggedIn: false },
  // Opción con función:
  {
    label: 'Cerrar Sesión',
    route: '',
    roles: ['admin', 'usuario', 'medico'],
    isLoggedIn: true,
    onClick: () => {},
  },
];

@Component({
  standalone: false,
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  sesion: any = null;
  usuarios: any;
  public navOptions = NAV_OPTIONS;

  /**
   * Constructor del componente
   * @param auth Servicio de autenticación
   * @param router Servicio de navegación
   */
  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.subscribeToSessionChanges();
    this.loadUsers();
  }

  private subscribeToSessionChanges(): void {
    this.auth.sesion$.subscribe((sesion) => {
      this.sesion = sesion;
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

  get userRole(): string | null {
    const sesion = this.getSesion();
    return sesion ? sesion.role.toLowerCase() : null;
  }

  /**
   * Verifica si el usuario actual es administrador
   * @returns {boolean} True si es admin, false si es usuario normal o no hay sesión
   */
  isAdmin(): boolean {
    return this.userRole === 'admin';
  }

  get filteredNavOptions(): NavOptions[] {
    const estaLogueado = this.estaLogueado();
    const role = this.userRole;

    return this.navOptions.filter((option) => {
      // 1. Filtrar por estado de autenticación
      if (option.isLoggedIn !== estaLogueado) {
        return false;
      }

      // 2. Si la opción es visible para todos (roles: []), o si el usuario está logueado
      // y su rol está incluido en la lista de roles permitidos para esa opción.
      if (estaLogueado && role) {
        // Opción visible si no requiere roles específicos, o si el rol del usuario está en la lista.
        return option.roles.length === 0 || option.roles.includes(role);
      } else {
        // Si NO está logueado, solo muestra opciones que permitan roles vacíos (públicas).
        // Estas opciones (Login, Registro) deben tener isLoggedIn: false.
        return option.roles.length === 0;
      }
    });
  }

  executeAction(option: NavOptions): void {
    if (option.onClick) {
      // Si tiene una función de clic definida (ej. Cerrar Sesión)
      this.cerrarSesion();
    } else if (option.route) {
      // Si tiene una ruta definida, navega
      this.router.navigate([option.route]);
    }
  }

  /**
   * Cierra la sesión actual y redirige al inicio
   */
  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/']);
  }
}
