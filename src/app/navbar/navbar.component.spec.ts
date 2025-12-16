import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { BehaviorSubject } from 'rxjs';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  const sesionSubject = new BehaviorSubject<any>(null);

  const authServiceMock = {
    sesion$: sesionSubject.asObservable(),
    cerrarSesion: jasmine.createSpy('cerrarSesion'),
  };

  const sesionAdminMock = {
    logueado: true,
    role: 'ADMIN',
  };

  beforeEach(async () => {
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'sesion') return JSON.stringify(sesionAdminMock);
      if (key === 'usuarios') return JSON.stringify([]);
      return null;
    });

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [RouterTestingModule.withRoutes([])], // 👈 CLAVE
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  // ============================
  // TESTS BÁSICOS
  // ============================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('estaLogueado debería retornar true si hay sesión', () => {
    expect(component.estaLogueado()).toBeTrue();
  });

  it('userRole debería retornar el rol en minúsculas', () => {
    expect(component.userRole).toBe('admin');
  });

  it('isAdmin debería retornar true para rol admin', () => {
    expect(component.isAdmin()).toBeTrue();
  });

  it('should actualizar sesion cuando AuthService emite', () => {
    const nuevaSesion = { logueado: true, role: 'MEDICO' };

    sesionSubject.next(nuevaSesion);

    expect(component.sesion).toEqual(nuevaSesion);
  });

  // ============================
  // filteredNavOptions
  // ============================

  it('filteredNavOptions debería incluir opciones permitidas para admin', () => {
    const labels = component.filteredNavOptions.map((o) => o.label);

    expect(labels).toContain('Inicio');
    expect(labels).toContain('Mi Perfil');
    expect(labels).toContain('Cerrar Sesión');
  });

  it('filteredNavOptions NO debería incluir Login cuando está logueado', () => {
    const labels = component.filteredNavOptions.map((o) => o.label);

    expect(labels).not.toContain('Iniciar Sesión');
    expect(labels).not.toContain('Registro');
  });

  it('filteredNavOptions debería mostrar Login y Registro cuando NO está logueado', () => {
    spyOn(component, 'estaLogueado').and.returnValue(false);

    const labels = component.filteredNavOptions.map((o) => o.label);

    expect(labels).toContain('Iniciar Sesión');
    expect(labels).toContain('Registro');
  });

  // ============================
  // executeAction
  // ============================

  it('executeAction debería navegar cuando la opción tiene ruta', () => {
    spyOn(router, 'navigate');

    component.executeAction({
      label: 'Inicio',
      route: '/',
      roles: [],
      isLoggedIn: true,
    });

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('executeAction debería cerrar sesión cuando la opción tiene onClick', () => {
    spyOn(component, 'cerrarSesion');

    component.executeAction({
      label: 'Cerrar Sesión',
      route: '',
      roles: [],
      isLoggedIn: true,
      onClick: () => {},
    });

    expect(component.cerrarSesion).toHaveBeenCalled();
  });

  it('cerrarSesion debería llamar al AuthService y redirigir', () => {
    spyOn(router, 'navigate');

    component.cerrarSesion();

    expect(authServiceMock.cerrarSesion).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});
