import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { vi } from 'vitest';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;
  let mockAuthService: any;
  let getItemSpy: ReturnType<typeof vi.spyOn>;

  // Función helper para mockear la sesión en localStorage
  function mockSesion(data: any | null) {
    getItemSpy.mockImplementation((key: string) => {
      if (key === 'sesion') {
        return data ? JSON.stringify(data) : null;
      }
      return null;
    });
  }

  beforeEach(async () => {
    mockAuthService = {
      sesion$: of(null),
      cerrarSesion: vi.fn()
    };

    await TestBed.configureTestingModule({
      declarations: [NavbarComponent],
      imports: [
        RouterTestingModule // Necesario para que [routerLink] funcione
      ],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
      // Ignora errores de elementos desconocidos (ej. iconos, componentes de bootstrap no importados)
      schemas: [NO_ERRORS_SCHEMA] 
    }).compileComponents();
  });

  beforeEach(() => {
    // Espiar localStorage.getItem y asignar a la variable para reutilizarla
    getItemSpy = vi.spyOn(localStorage, 'getItem').mockReturnValue(null);
    
    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate'); 
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe tener opciones de menú iniciales', () => {
    expect(component.navOptions.length).toBeGreaterThan(0);
  });

  it('debe retornar false si no hay sesión', () => {
    mockSesion(null);
    expect(component.estaLogueado()).toBeFalsy();
  });


  it('debe retornar false si la sesión no está logueada', () => {
    mockSesion({ isLoggedIn: false, role: 'MEDICO', area: 'medico' });
    expect(component.estaLogueado()).toBeFalsy();
  });

  it('debe retornar false si no hay sesión', () => {
    mockSesion(null);
    expect(component.estaLogueado()).toBeFalsy();
  }); 


  it('debe retornar null si no hay sesión', () => {
    mockSesion(null);
    expect(component.userRole).toBeNull();
  });

  it('debe mostrar solo Login y Registro si no está isLoggedIn', () => {
    mockSesion(null);

    const options = component.navOptions.map(o => o.label);

    expect(options).toContain('Iniciar Sesión');
    expect(options).toContain('Registro');
  });


  it('debe mostrar todas las opciones si está isLoggedIn y es Medico Admin', () => {
    mockSesion({ isLoggedIn: true, role: 'admin', area: 'Medicos' });

    const options = component.navOptions.map(o => o.label);

    expect(options).toContain('Inicio');
    expect(options).toContain('Pacientes');
    expect(options).toContain('Reservas');
    expect(options).toContain('Mi Perfil');
    expect(options).toContain('Cerrar Sesión');
  });

  it('debe navegar a la ruta cuando la opción tiene route', () => {
    const option = {
      label: 'Inicio',
      route: '/',
      roles: [],
      isLoggedIn: true,
    };

    component.executeAction(option);

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
  
  it('debe cerrar sesión cuando la opción tiene onClick', () => {
    const option = {
      label: 'Cerrar Sesión',
      route: '',
      roles: [],
      isLoggedIn: true,
      onClick: () => {},
    };

    component.executeAction(option);

    expect(mockAuthService.cerrarSesion).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debe cerrar sesión y redirigir al inicio', () => {
    component.cerrarSesion();

    expect(mockAuthService.cerrarSesion).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
});