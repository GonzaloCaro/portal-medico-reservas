import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { skip, take } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    localStorage.clear();
  });

  it('debería crearse', () => {
    service = TestBed.inject(AuthService);
    expect(service).toBeTruthy();
  });

  it('debería inicializar el Observable con datos si existen en localStorage al inicio', (done) => {
    const sesionGuardada = { logueado: true, user: 'test' };
    localStorage.setItem('sesion', JSON.stringify(sesionGuardada));

    // Inyectamos el servicio DESPUÉS de setear el localStorage
    service = TestBed.inject(AuthService);

    service.sesion$.pipe(take(1)).subscribe((sesion) => {
      expect(sesion).toEqual(sesionGuardada);
      done();
    });
  });

  // Tests existentes conservados y verificados
  it('getSesion debería retornar null si no hay sesión', () => {
    service = TestBed.inject(AuthService);
    expect(service.getSesion()).toBeNull();
  });

  it('estaLogueado debería retornar false si no hay sesión', () => {
    service = TestBed.inject(AuthService);
    expect(service.estaLogueado()).toBeFalse();
  });

  it('esAdmin debería retornar true solo si tipo es admin', () => {
    service = TestBed.inject(AuthService);

    localStorage.setItem('sesion', JSON.stringify({ tipo: 'user' }));
    expect(service.esAdmin()).toBeFalse();

    localStorage.setItem('sesion', JSON.stringify({ tipo: 'admin' }));
    expect(service.esAdmin()).toBeTrue();
  });

  it('iniciarSesion debería guardar y emitir', (done) => {
    service = TestBed.inject(AuthService);
    const data = { token: 'abc' };

    service.iniciarSesion(data);

    expect(localStorage.getItem('sesion')).toContain('abc');

    service.sesion$.pipe(take(1)).subscribe((sesion) => {
      expect(sesion).toEqual(data);
      done();
    });
  });

  it('cerrarSesion debería limpiar y emitir null', () => {
    service = TestBed.inject(AuthService);
    localStorage.setItem('sesion', 'algo');

    service.cerrarSesion();

    expect(localStorage.getItem('sesion')).toBeNull();
  });
});
