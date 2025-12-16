import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { environment } from '../../enviroments/enviroment';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [{ provide: Router }, ChangeDetectorRef],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('edadMinimaValidator debería invalidar menores de 14', () => {
    const control = { value: new Date() } as any;
    const result = component.edadMinimaValidator(control);
    expect(result).toEqual({ edadMinima: true });
  });

  it('passwordsIgualesValidator debería detectar contraseñas distintas', () => {
    component['initializeForm']();
    component.registerForm?.patchValue({
      password: '1234',
      password2: '4321',
    });

    const errors = component.registerForm?.errors;
    expect(errors).toEqual({ contrasenasNoCoinciden: true });
  });

  it('no debería enviar si el formulario es inválido', () => {
    component['initializeForm']();
    component.registrar();

    expect(component.error).toContain('Revisa los campos');
  });

  it('debería mostrar error si falla el registro', () => {
    component['initializeForm']();

    component.registerForm?.setValue({
      nombre: 'Juan',
      apellido: 'Pérez',
      usuario: 'juanp',
      email: 'juan@test.com',
      fechaNacimiento: '2000-01-01',
      password: '1234',
      password2: '1234',
      areaId: '1',
      roleId: '1',
    });

    component.registrar();

    const req = httpMock.expectOne(`${environment.apiAuthUrl}/api/usuarios`);
    req.flush({ message: 'Usuario ya existe' }, { status: 400, statusText: 'Bad Request' });

    expect(component.error).toContain('Usuario ya existe');
  });
});
