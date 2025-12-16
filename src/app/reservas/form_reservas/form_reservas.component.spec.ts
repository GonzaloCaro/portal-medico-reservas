import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormReservasComponent } from './form_reservas.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { vi } from 'vitest';
import { FormBuilder } from '@angular/forms';

describe('FormReservasComponent', () => {
  let component: FormReservasComponent;
  let fixture: ComponentFixture<FormReservasComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    routerSpy = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      declarations: [FormReservasComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [FormBuilder, { provide: Router, useValue: routerSpy }, ChangeDetectorRef],
    }).compileComponents();

    fixture = TestBed.createComponent(FormReservasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // 🔥 evita HTTP en ngOnInit
    vi.spyOn(component as any, 'loadLabsAndAnalisis').mockResolvedValue(undefined);
    vi.spyOn(component, 'getAllPacientes').mockResolvedValue([]);

    fixture.detectChanges();
  });

  // =====================
  // CREACIÓN Y FORMULARIO
  // =====================

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar el formulario con controles requeridos', () => {
    expect(component.reserfaForm).toBeTruthy();
    expect(component.reserfaForm.get('laboratorioId')).toBeTruthy();
    expect(component.reserfaForm.get('analisisId')).toBeTruthy();
    expect(component.reserfaForm.get('detalle')).toBeTruthy();
  });

  // =====================
  // VALIDADORES
  // =====================

  it('debe activar validadores de nuevo paciente', () => {
    component.reserfaForm.get('crearNuevoPaciente')?.setValue(true);

    expect(component.esNuevoPaciente).toBe(true);
    expect(component.reserfaForm.get('rut')?.hasValidator).toBeDefined();
    expect(component.reserfaForm.get('pacienteId')?.validator).toBeNull();
  });

  it('debe volver a validadores de paciente existente', () => {
    component.reserfaForm.get('crearNuevoPaciente')?.setValue(false);

    expect(component.esNuevoPaciente).toBe(false);
    expect(component.reserfaForm.get('pacienteId')?.validator).toBeTruthy();
  });

  // =====================
  // AUTH HEADERS
  // =====================

  it('getAuthHeaders debe retornar headers vacíos si no hay token', () => {
    const headers = (component as any).getAuthHeaders();
    expect(headers.keys().length).toBe(0);
  });

  it('getAuthHeaders debe incluir Authorization si hay token', () => {
    localStorage.setItem('accessToken', 'token-test');
    const headers = (component as any).getAuthHeaders();
    expect(headers.get('Authorization')).toBe('Bearer token-test');
  });

  // =====================
  // LOAD LABS & ANALISIS
  // =====================

  it('loadLabsAndAnalisis debe cargar y mapear datos', async () => {
    vi.restoreAllMocks();

    component.ngOnInit();

    const reqLabs = httpMock.expectOne((req) => req.url.includes('/laboratorios'));
    reqLabs.flush({
      _embedded: { laboratorioList: [{ id: '1', nombre: 'Lab 1' }] },
    });

    const reqAna = httpMock.expectOne((req) => req.url.includes('/analisis'));
    reqAna.flush({
      _embedded: {
        analisisList: [{ id: '2', nombre: 'Ana 1' }],
      },
    });

    expect(component.laboratorios).toEqual([{ id: '1', nombre: 'Lab 1' }]);
    expect(component.analisis).toEqual([{ id: '2', nombre: 'Ana 1' }]);
  });

  it('loadLabsAndAnalisis debe usar fallback en error', async () => {
    vi.restoreAllMocks();

    component.ngOnInit();

    const reqLabs = httpMock.expectOne((req) => req.url.includes('/laboratorios'));
    reqLabs.error(new ErrorEvent('error'));

    expect(component.laboratorios.length).toBeGreaterThan(0);
    expect(component.analisis.length).toBeGreaterThan(0);
  });

  // =====================
  // PACIENTES
  // =====================

  it('getAllPacientes debe cargar pacientes', async () => {
    const promise = component.getAllPacientes();

    const req = httpMock.expectOne((req) => req.url.includes('/paciente'));
    req.flush({
      _embedded: {
        pacienteList: [{ id: 'p1', nombre: 'Juan' }],
      },
    });

    const result = await promise;
    expect(result.length).toBe(1);
  });

  it('getAllPacientes debe manejar error sin romper', async () => {
    const promise = component.getAllPacientes();

    const req = httpMock.expectOne((req) => req.url.includes('/paciente'));
    req.error(new ErrorEvent('error'));

    const result = await promise;
    expect(result).toEqual([]);
  });

  // =====================
  // SUBMIT
  // =====================

  it('onSubmit no debe enviar si el formulario es inválido', async () => {
    const spy = vi.spyOn(component.reserfaForm, 'markAllAsTouched');

    await component.onSubmit();

    expect(spy).toHaveBeenCalled();
  });

  it('onSubmit debe abortar si no hay sesión', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.reserfaForm.patchValue({
      laboratorioId: '1',
      analisisId: '2',
      detalle: 'test',
      pacienteId: 'p1',
    });

    await component.onSubmit();

    expect(window.alert).toHaveBeenCalled();
  });

  it('onSubmit debe crear reserva con paciente existente', async () => {
    localStorage.setItem('sesion', JSON.stringify({ userId: 'user-1' }));
    localStorage.setItem('accessToken', 'token');

    component.reserfaForm.patchValue({
      laboratorioId: '1',
      analisisId: '2',
      detalle: 'detalle',
      pacienteId: 'p1',
    });

    const submit = component.onSubmit();

    const req = httpMock.expectOne((req) => req.url.includes('/asignacion_lab'));

    expect(req.request.body.pacienteId).toBe('p1');
    req.flush({});

    await submit;
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reservas']);
  });

  it('onSubmit debe manejar error HTTP', async () => {
    localStorage.setItem('sesion', JSON.stringify({ userId: 'user-1' }));
    localStorage.setItem('accessToken', 'token');
    vi.spyOn(window, 'alert').mockImplementation(() => {});

    component.reserfaForm.patchValue({
      laboratorioId: '1',
      analisisId: '2',
      detalle: 'detalle',
      pacienteId: 'p1',
    });

    const submit = component.onSubmit();

    const req = httpMock.expectOne((req) => req.url.includes('/asignacion_lab'));
    req.error(new ErrorEvent('error'));

    await submit;
    expect(window.alert).toHaveBeenCalled();
  });
});
