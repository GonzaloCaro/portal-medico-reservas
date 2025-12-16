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

    fixture.detectChanges(); // ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });
  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });
  it('debería inicializar el formulario', () => {
    expect(component.loginForm).toBeDefined();
    expect(component.f['user_name']).toBeDefined();
    expect(component.f['password']).toBeDefined();
  });
  it('el formulario debería ser inválido inicialmente', () => {
    expect(component.loginForm.invalid).toBeTrue();
  });
  it('login no debería llamar al backend si el formulario es inválido', () => {
    spyOn<any>(component, 'authenticateUser');

    component.login();

    expect(component.loginForm.touched).toBeTrue();
    expect(component['authenticateUser']).not.toHaveBeenCalled();
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
  });
  it('debería guardar sesión y redirigir al hacer login exitoso', () => {
    spyOn(router, 'navigate');

    component.loginForm.setValue({
      user_name: 'admin',
      password: '123456',
    });

    component.login();

    const req = httpMock.expectOne(AUTH_URL);

    req.flush({
      accessToken: 'token123',
      roleNombre: 'admin',
      areaNombre: 'IT',
      userId: '1',
      userName: 'admin',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
    });

    const sesion = JSON.parse(localStorage.getItem('sesion')!);

    expect(sesion.logueado).toBeTrue();
    expect(sesion.role).toBe('admin');
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });
  it('debería marcar error en login fallido', () => {
    component.loginForm.setValue({
      user_name: 'admin',
      password: 'wrong',
    });

    component.login();

    const req = httpMock.expectOne(AUTH_URL);
    req.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(component.error).toBeTrue();
  });

  // it('togglePasswordVisibility debería alternar el tipo de input', () => {
  //   const input = document.createElement('input');
  //   input.type = 'password';
  //   input.id = 'password';
  //   document.body.appendChild(input);

  //   // Primer toggle: password -> text
  //   component.togglePasswordVisibility();
  //   expect(input.type).toBe('text');

  //   // Segundo toggle: text -> password
  //   component.togglePasswordVisibility();
  //   expect(input.type).toBe('password');

  //   document.body.removeChild(input);
  // });
  
  it('user_name debería ser requerido', () => {
    const control = component.f['user_name'];
    control.setValue('');
    expect(control.invalid).toBeTrue();
  });

  it('password debería ser requerido', () => {
    const control = component.f['password'];
    control.setValue('');
    expect(control.invalid).toBeTrue();
  });
});
