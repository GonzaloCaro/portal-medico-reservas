import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
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

  const API_URL = environment.apiAuthUrl;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [{ provide: Router, useValue: routerSpy }, ChangeDetectorRef],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // NO llamamos a fixture.detectChanges() aquí para controlar ngOnInit manualmente
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  // --- Tests de carga inicial (ngOnInit) ---

  it('debería cargar áreas y roles exitosamente al iniciar', fakeAsync(() => {
    // Disparar ngOnInit
    fixture.detectChanges();

    const reqAreas = httpMock.expectOne(`${API_URL}/api/areas`);
    const reqRoles = httpMock.expectOne(`${API_URL}/api/roles`);

    expect(reqAreas.request.method).toBe('GET');
    expect(reqRoles.request.method).toBe('GET');

    // Simular respuestas
    reqAreas.flush({ _embedded: { areaList: [{ id: '1', nombre: 'Area1' }] } });
    reqRoles.flush({ _embedded: { rolList: [{ id: '1', nombre: 'Rol1' }] } });

    // Esperar a que se resuelvan las promesas
    tick();

    expect(component.areas.length).toBe(1);
    expect(component.roles.length).toBe(1);
    expect(component.error).toBe('');
    expect(component.loadingData).toBeFalse();
  }));

  it('debería manejar error si la carga inicial falla', fakeAsync(() => {
    fixture.detectChanges();

    const reqAreas = httpMock.expectOne(`${API_URL}/api/areas`);
    const reqRoles = httpMock.expectOne(`${API_URL}/api/roles`);

    // Simular error en una de las peticiones
    reqAreas.flush(null, { status: 500, statusText: 'Server Error' });
    reqRoles.flush({}); // El otro responde bien o mal, igual debe fallar Promise.all

    tick();

    expect(component.error).toContain('Error de conexión');
  }));

  it('debería mostrar error si llegan listas vacías', fakeAsync(() => {
    fixture.detectChanges();

    const reqAreas = httpMock.expectOne(`${API_URL}/api/areas`);
    const reqRoles = httpMock.expectOne(`${API_URL}/api/roles`);

    reqAreas.flush({ _embedded: { areaList: [] } });
    reqRoles.flush({ _embedded: { rolList: [] } });

    tick();

    expect(component.error).toContain('No se pudo cargar la información');
  }));

  // --- Tests de Validaciones ---

  it('edadMinimaValidator debería validar correctamente los casos borde', () => {
    const validador = component.edadMinimaValidator;
    const hoy = new Date();

    // Caso 1: Tiene 13 años (Inválido)
    const fecha13 = new Date(hoy.getFullYear() - 13, hoy.getMonth(), hoy.getDate());
    expect(validador({ value: fecha13 } as any)).toEqual({ edadMinima: true });

    // Caso 2: Tiene 14 años exactos (Válido)
    const fecha14 = new Date(hoy.getFullYear() - 14, hoy.getMonth(), hoy.getDate());
    expect(validador({ value: fecha14 } as any)).toBeNull();

    // Caso 3: Tiene 14 años pero cumple el mes que viene (Tiene 13 en realidad -> Inválido)
    // Mes actual + 1. Si es diciembre (11), sumamos y ajustamos año si hace falta, pero para simpleza:
    let mesFuturo = hoy.getMonth() + 1;
    let anio = hoy.getFullYear() - 14;
    if (mesFuturo > 11) {
      mesFuturo = 0;
      anio++;
    } // edge case fin de año

    // Forzamos fecha que aún no ha cumplido en el año corriente
    const fechaCasi14 = new Date(hoy.getFullYear() - 14, hoy.getMonth() + 1, hoy.getDate());
    // Si hoy es Diciembre, esto testearía Enero del año siguiente, cuidado con la lógica de JS Date
    // Mejor lógica manual:
    const fechaNoCumplida = new Date();
    fechaNoCumplida.setFullYear(hoy.getFullYear() - 14);
    fechaNoCumplida.setMonth(hoy.getMonth() + 1); // Cumple el mes que viene

    expect(validador({ value: fechaNoCumplida } as any)).toEqual({ edadMinima: true });
  });

  it('passwordsIgualesValidator debería validar coincidencia', () => {
    // Inicializar componente para tener el FormBuilder listo (aunque no llamamos backend)
    // Mockeamos initializeForm para no depender de ngOnInit
    component['initializeForm']();

    const form = component.registerForm!;
    form.patchValue({ password: '123', password2: '123' });
    expect(component.passwordsIgualesValidator(form)).toBeNull();

    form.patchValue({ password: '123', password2: '456' });
    expect(component.passwordsIgualesValidator(form)).toEqual({ contrasenasNoCoinciden: true });
  });

  // --- Tests de Registro (Submit) ---

  it('no debería enviar formulario si es inválido', () => {
    component['initializeForm'](); // Inicializamos form manualmente
    component.registrar();

    expect(component.error).toContain('Revisa los campos');
  });

  it('debería registrar usuario exitosamente y redirigir después de timeout', fakeAsync(() => {
    component['initializeForm']();

    // Llenar formulario válido
    component.registerForm?.setValue({
      nombre: 'Test',
      apellido: 'User',
      usuario: 'testuser',
      email: 'test@mail.com',
      fechaNacimiento: '1990-01-01',
      password: 'pass',
      password2: 'pass',
      areaId: '1',
      roleId: '2',
    });

    component.registrar();

    const req = httpMock.expectOne(`${API_URL}/api/usuarios`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      nombre: 'Test',
      apellido: 'User',
      userName: 'testuser',
      email: 'test@mail.com',
      contrasena: 'pass',
      areaId: '1',
      roleId: '2',
    });

    req.flush({ id: 1, usuario: 'testuser' }); // Respuesta exitosa

    expect(component.exito).toContain('Usuario registrado con éxito');

    // Avanzamos el tiempo para el setTimeout(1500)
    tick(1500);

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  }));

  it('debería manejar error del backend al registrar', fakeAsync(() => {
    component['initializeForm']();

    // Llenar formulario válido para pasar la primera validación
    component.registerForm?.setValue({
      nombre: 'Test',
      apellido: 'User',
      usuario: 'existente',
      email: 'test@mail.com',
      fechaNacimiento: '1990-01-01',
      password: 'pass',
      password2: 'pass',
      areaId: '1',
      roleId: '2',
    });

    component.registrar();

    const req = httpMock.expectOne(`${API_URL}/api/usuarios`);
    req.flush({ message: 'El usuario ya existe' }, { status: 409, statusText: 'Conflict' });

    expect(component.error).toContain('Error al registrar');
  }));
});
