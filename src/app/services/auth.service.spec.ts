import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { skip, take } from 'rxjs/operators';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  it('debería crearse', () => {
    expect(service).toBeTruthy();
  });

  it('getSesion debería retornar null si no hay sesión', () => {
    expect(service.getSesion()).toBeNull();
  });

  it('getSesion debería retornar la sesión desde localStorage', () => {
    const sesionMock = { logueado: true, tipo: 'user' };
    localStorage.setItem('sesion', JSON.stringify(sesionMock));

    expect(service.getSesion()).toEqual(sesionMock);
  });

  it('estaLogueado debería retornar false si no hay sesión', () => {
    expect(service.estaLogueado()).toBeFalse();
  });

  it('estaLogueado debería retornar true si la sesión está logueada', () => {
    localStorage.setItem('sesion', JSON.stringify({ logueado: true }));

    expect(service.estaLogueado()).toBeTrue();
  });

  it('esAdmin debería retornar false si no es admin', () => {
    localStorage.setItem('sesion', JSON.stringify({ tipo: 'user' }));

    expect(service.esAdmin()).toBeFalse();
  });

  it('esAdmin debería retornar true si el usuario es admin', () => {
    localStorage.setItem('sesion', JSON.stringify({ tipo: 'admin' }));

    expect(service.esAdmin()).toBeTrue();
  });

  it('iniciarSesion debería guardar la sesión y emitirla', () => {
    const sesionMock = { logueado: true, tipo: 'admin' };

    service.sesion$.pipe(skip(1), take(1)).subscribe((sesion) => {
      expect(sesion).toEqual(sesionMock);
      expect(JSON.parse(localStorage.getItem('sesion')!)).toEqual(sesionMock);
    });

    service.iniciarSesion(sesionMock);
  });
  it('cerrarSesion debería limpiar la sesión y emitir null', (done) => {
    localStorage.setItem('sesion', JSON.stringify({ logueado: true }));

    service.sesion$.pipe(skip(1)).subscribe((sesion) => {
      expect(sesion).toBeNull();
      done();
    });

    service.cerrarSesion();
  });
});
