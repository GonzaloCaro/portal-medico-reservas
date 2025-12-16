import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth.service';
import { environment } from '../../enviroments/enviroment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;

  const AUTH_URL = `${environment.apiAuthUrl}/api/auth/login`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule, RouterTestingModule],
      providers: [AuthService],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    fixture.detectChanges(); // Renderiza el HTML inicial
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    // NOTA: Eliminamos la limpieza manual del DOM aquí porque causaba el error
    // "The node to be removed is not a child of this node".
    // Angular se encarga de destruir el componente automáticamente.
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería inicializar el formulario correctamente', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.f['user_name']).toBeDefined();
    expect(component.f['password']).toBeDefined();
    expect(component.loginForm.invalid).toBeTrue();
  });

  it('login no debería proceder si el formulario es inválido', () => {
    const authSpy = spyOn<any>(component, 'authenticateUser');
    component.login();
    expect(component.loginForm.touched).toBeTrue();
    expect(authSpy).not.toHaveBeenCalled();
  });

  it('login debería llamar al backend con credenciales válidas', () => {
    component.loginForm.setValue({
      user_name: 'admin',
      password: '123456',
    });

    component.login();

    const req = httpMock.expectOne(AUTH_URL);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      userName: 'admin',
      password: '123456',
    });
    req.flush({});
  });

  it('debería guardar sesión completa y redirigir al hacer login exitoso', () => {
    spyOn(router, 'navigate');

    component.loginForm.setValue({
      user_name: 'testuser',
      password: 'password',
    });

    component.login();

    const req = httpMock.expectOne(AUTH_URL);
    const mockResponse = {
      accessToken: 'token_abc',
      roleNombre: 'medico',
      areaNombre: 'Cardiologia',
      userId: '10',
      userName: 'doc_house',
      nombre: 'Gregory',
      apellido: 'House',
      email: 'house@hospital.com',
    };

    req.flush(mockResponse);

    expect(localStorage.getItem('accessToken')).toBe('token_abc');
    const sesionGuardada = JSON.parse(localStorage.getItem('sesion')!);

    expect(sesionGuardada).toEqual({
      logueado: true,
      role: 'medico',
      area: 'Cardiologia',
      userId: '10',
      userName: 'doc_house',
      nombre: 'Gregory',
      apellido: 'House',
      email: 'house@hospital.com',
      token: 'token_abc',
    });

    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('debería manejar error en login (credenciales incorrectas)', () => {
    spyOn(console, 'error'); // Silenciar error en consola

    component.loginForm.setValue({
      user_name: 'baduser',
      password: 'badpass',
    });

    component.login();

    const req = httpMock.expectOne(AUTH_URL);
    req.flush({ message: 'Credenciales inválidas' }, { status: 401, statusText: 'Unauthorized' });

    expect(component.error).toBeTrue();
  });

  it('togglePasswordVisibility debería alternar el tipo de input password <-> text', () => {
    // Buscamos el input real en el DOM renderizado por el componente
    // Nota: Esto asume que tu login.component.html tiene un <input id="password">
    let input = document.getElementById('password') as HTMLInputElement;

    // Si el input es nulo, significa que el template HTML no tiene id="password".
    // En ese caso el test fallará con un mensaje claro.
    if (!input) {
      fail(
        'No se encontró el elemento <input id="password"> en el DOM. Verifica el HTML del componente.'
      );
      return;
    }

    // Aseguramos estado inicial
    input.type = 'password';

    // 1. Ejecutar toggle -> Debería cambiar a text
    component.togglePasswordVisibility();
    expect(input.type).toBe('text');

    // 2. Ejecutar toggle de nuevo -> Debería volver a password
    component.togglePasswordVisibility();
    expect(input.type).toBe('password');
  });

  it('validaciones de campos individuales', () => {
    const userControl = component.f['user_name'];
    const passControl = component.f['password'];

    userControl.setValue('');
    passControl.setValue('');

    expect(userControl.hasError('required')).toBeTrue();
    expect(passControl.hasError('required')).toBeTrue();
  });
});
