import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PerfilComponent } from './perfil.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { environment } from '../../enviroments/enviroment';

describe('PerfilComponent', () => {
  let component: PerfilComponent;
  let fixture: ComponentFixture<PerfilComponent>;
  let httpMock: HttpTestingController;

  const sesionMock = {
    userId: '123',
    usuario: 'juanperez',
    userName: 'juanperez',
    nombre: 'Juan',
    apellido: 'Pérez',
    email: 'juan@test.com',
    role: 'ADMIN',
    area: 'TI',
    logueado: true,
  };

  const usuariosMock = [
    {
      userId: '123',
      usuario: 'juanperez',
      userName: 'juanperez',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      role: 'ADMIN',
      area: 'TI',
    },
  ];

  beforeEach(async () => {
    // 🔹 Mock localStorage SOLO UNA VEZ
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'sesion') return JSON.stringify(sesionMock);
      if (key === 'usuarios') return JSON.stringify(usuariosMock);
      if (key === 'accessToken') return 'fake-token';
      return null;
    });

    spyOn(localStorage, 'setItem').and.callFake(() => {});

    await TestBed.configureTestingModule({
      declarations: [PerfilComponent],
      imports: [
        HttpClientTestingModule,
        FormsModule, // necesario por ngModel
      ],
      providers: [
        { provide: AuthService, useValue: {} }, // no se usa directamente
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PerfilComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    fixture.detectChanges(); // ngOnInit
  });

  afterEach(() => {
    httpMock.verify();
  });

  // =========================
  // TESTS BÁSICOS
  // =========================

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cargar sesión y usuarios desde localStorage', () => {
    expect(component.sesion).toBeTruthy();
    expect(component.sesion.nombre).toBe('Juan');
    expect(component.usuarios.length).toBe(1);
  });

  // =========================
  // guardarCambios
  // =========================

  it('should mostrar error si no hay userId', () => {
    component.sesion = { ...sesionMock, userId: null };

    component.guardarCambios();

    expect(component.mensaje).toBe('❌ Error: ID de usuario no encontrado.');
  });

  it('should enviar PUT y guardar cambios correctamente', () => {
    component.guardarCambios();

    const req = httpMock.expectOne(`${environment.apiAuthUrl}/api/usuarios/${sesionMock.userId}`);

    expect(req.request.method).toBe('PUT');
    expect(req.request.headers.get('Authorization')).toBe('Bearer fake-token');

    // Simular respuesta OK
    req.flush({});

    expect(localStorage.setItem).toHaveBeenCalledWith('sesion', JSON.stringify(component.sesion));
    expect(component.mensaje).toBe('Cambios guardados correctamente.');
  });

  it('should mostrar mensaje de error si falla el PUT', () => {
    component.guardarCambios();

    const req = httpMock.expectOne(`${environment.apiAuthUrl}/api/usuarios/${sesionMock.userId}`);

    req.flush({ message: 'Error' }, { status: 500, statusText: 'Internal Server Error' });

    expect(component.mensaje).toContain('Error al guardar');
  });

  // =========================
  // TEMPLATE
  // =========================

  it('should mostrar nombre y email en el template', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    const name = compiled.querySelector('#profileName')?.textContent;
    const email = compiled.querySelector('#profileEmail')?.textContent;

    expect(name).toContain('Juan');
    expect(email).toContain('juan@test.com');
  });
});
