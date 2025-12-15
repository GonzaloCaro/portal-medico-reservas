// src/app/navbar/navbar.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NO_ERRORS_SCHEMA } from '@angular/core';

// 1. Mock para el Router
const mockRouter = {
  navigate: jasmine.createSpy('navigate'),
};

// 2. Mock para AuthService
// Usaremos un Subject o un Observable para simular el flujo de sesión
const mockAuthService = {
  sesion$: of(null), // Observable que simula la sesión
  cerrarSesion: jasmine.createSpy('cerrarSesion'),
};

// 3. Mock para localStorage (simulamos que no existe en el entorno de prueba)
// Esto es importante para que getSesion() y estaLogueado() funcionen correctamente
const mockLocalStorage = {
  getItem: jasmine.createSpy('getItem').and.returnValue(null),
  setItem: jasmine.createSpy('setItem'),
  removeItem: jasmine.createSpy('removeItem'),
};

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule.forRoot([]), NgbModule],
      declarations: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;

    authService = TestBed.inject(AuthService);

    // 3. Inyectamos el router real y le ponemos un espía al método navigate
    router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  // --- Caso de Prueba: Usuario NO autenticado (Anonimo) ---
  it('debe mostrar solo las opciones públicas (Login/Registro) si no está logueado', () => {
    // 1. Configuración: Asegurar que localStorage no tiene sesión
    mockLocalStorage.getItem.and.returnValue(null);

    // Forzar la re-evaluación del estado
    component.sesion = null;
    fixture.detectChanges();

    const options = component.filteredNavOptions.map((opt) => opt.label);

    // Solo deben aparecer Iniciar Sesión y Registro (roles: [], isLoggedIn: false)
    expect(options).toEqual(['Iniciar Sesión', 'Registro']);
    expect(component.estaLogueado()).toBeFalse();
    expect(component.userRole).toBeNull();
  });

  // --- Caso de Prueba: Usuario tipo ADMIN ---
  it('debe mostrar todas las opciones de Admin cuando el usuario es "admin"', () => {
    const adminSession = JSON.stringify({
      logueado: true,
      tipo: 'admin', // Nota: El componente usa sesion.tipo para isAdmin()
      role: 'admin', // Nota: El componente usa sesion.role para filteredNavOptions
      userName: 'AdminUser',
    });

    // 1. Configuración: Simular sesión de Admin
    mockLocalStorage.getItem.and.returnValue(adminSession);

    // Forzar re-evaluación
    fixture.detectChanges();

    const options = component.filteredNavOptions.map((opt) => opt.label);

    // Esperamos las 8 opciones (Inicio, Pacientes, Reservas, Laboratorios, Analisis, Mi Perfil, Cerrar Sesión)
    expect(component.estaLogueado()).toBeTrue();
    expect(component.userRole).toBe('admin');
    expect(options.length).toBe(8);
    expect(options).toContain('Pacientes');
    expect(options).toContain('Laboratorios');
    expect(options).toContain('Analisis');
    expect(options).not.toContain('Iniciar Sesión');
  });

  // --- Caso de Prueba: Usuario tipo LABORATORIO ---
  it('debe mostrar solo opciones relevantes para Laboratorio', () => {
    const labSession = JSON.stringify({
      logueado: true,
      tipo: 'laboratorio', // Si tu sistema usa 'tipo' para el rol
      role: 'laboratorio',
      userName: 'LabUser',
    });

    mockLocalStorage.getItem.and.returnValue(labSession);
    fixture.detectChanges();

    const options = component.filteredNavOptions.map((opt) => opt.label);

    // Opciones esperadas para 'laboratorio': Inicio, Laboratorios, Analisis, Mi Perfil, Cerrar Sesión
    expect(component.userRole).toBe('laboratorio');
    expect(options.length).toBe(5);
    expect(options).toContain('Laboratorios');
    expect(options).toContain('Analisis');
    expect(options).not.toContain('Pacientes');
  });

  // --- Caso de Prueba: Funcionalidad de Cerrar Sesión ---
  it('debe llamar a cerrarSesion y navegar a inicio al ejecutar la acción de "Cerrar Sesión"', () => {
    const cerrarSesionOption = component.navOptions.find((opt) => opt.label === 'Cerrar Sesión');

    // 1. Ejecutar la acción
    if (cerrarSesionOption) {
      component.executeAction(cerrarSesionOption);
    }

    // 2. Verificar que el servicio fue llamado
    expect(mockAuthService.cerrarSesion).toHaveBeenCalled();

    // 3. Verificar la navegación
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });

  // --- Caso de Prueba: Funcionalidad de Navegación Estándar ---
  it('debe navegar a la ruta correcta al ejecutar una opción estándar', () => {
    const perfilOption = component.navOptions.find((opt) => opt.label === 'Mi Perfil');

    // 1. Ejecutar la acción
    if (perfilOption) {
      component.executeAction(perfilOption);
    }

    // 2. Verificar la navegación
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/perfil']);
  });
});
