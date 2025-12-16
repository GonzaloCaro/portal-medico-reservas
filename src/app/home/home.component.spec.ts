import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  describe('getSesion', () => {
    it('debería retornar null si no hay sesión en localStorage', () => {
      expect(component.getSesion()).toBeNull();
    });

    it('debería retornar el objeto de sesión si existe en localStorage', () => {
      const sesionMock = { logueado: true, usuario: 'Juan' };
      localStorage.setItem('sesion', JSON.stringify(sesionMock));

      expect(component.getSesion()).toEqual(sesionMock);
    });
  });

  describe('estaLogueado', () => {
    it('debería retornar false si no hay sesión', () => {
      expect(component.estaLogueado()).toBeFalse();
    });

    it('debería retornar false si sesión existe pero logueado es false', () => {
      const sesionMock = { logueado: false, usuario: 'Juan' };
      localStorage.setItem('sesion', JSON.stringify(sesionMock));

      expect(component.estaLogueado()).toBeFalse();
    });

    it('debería retornar true si sesión existe y logueado es true', () => {
      const sesionMock = { logueado: true, usuario: 'Juan' };
      localStorage.setItem('sesion', JSON.stringify(sesionMock));

      expect(component.estaLogueado()).toBeTrue();
    });
  });
});
