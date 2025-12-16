import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormReservasComponent } from './form_reservas.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

describe('FormReservasComponent', () => {
  let component: FormReservasComponent;
  let fixture: ComponentFixture<FormReservasComponent>;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [FormReservasComponent],
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [FormBuilder, { provide: Router, useValue: routerSpy }, ChangeDetectorRef],
    }).compileComponents();

    fixture = TestBed.createComponent(FormReservasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // 🔥 evitar HTTP real en ngOnInit
    spyOn(component as any, 'loadLabsAndAnalisis').and.returnValue(Promise.resolve());
    spyOn(component, 'getAllPacientes').and.returnValue(Promise.resolve([]));

    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
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

    expect(component.esNuevoPaciente).toBeTrue();
    expect(component.reserfaForm.get('rut')?.validator).toBeTruthy();
    expect(component.reserfaForm.get('pacienteId')?.validator).toBeNull();
  });

  it('debe volver a validadores de paciente existente', () => {
    component.reserfaForm.get('crearNuevoPaciente')?.setValue(false);

    expect(component.esNuevoPaciente).toBeFalse();
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
  // SUBMIT
  // =====================

  it('onSubmit no debe enviar si el formulario es inválido', async () => {
    spyOn(component.reserfaForm, 'markAllAsTouched');

    await component.onSubmit();

    expect(component.reserfaForm.markAllAsTouched).toHaveBeenCalled();
  });

  it('onSubmit debe abortar si no hay sesión', async () => {
    spyOn(window, 'alert');

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

    const submitPromise = component.onSubmit();

    const req = httpMock.expectOne((r) => r.url.includes('/asignacion_lab'));

    expect(req.request.body.pacienteId).toBe('p1');
    req.flush({});

    await submitPromise;
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reservas']);
  });

  it('onSubmit debe manejar error HTTP', async () => {
    localStorage.setItem('sesion', JSON.stringify({ userId: 'user-1' }));
    localStorage.setItem('accessToken', 'token');
    spyOn(window, 'alert');

    component.reserfaForm.patchValue({
      laboratorioId: '1',
      analisisId: '2',
      detalle: 'detalle',
      pacienteId: 'p1',
    });

    const submitPromise = component.onSubmit();

    const req = httpMock.expectOne((r) => r.url.includes('/asignacion_lab'));
    req.error(new ErrorEvent('error'));

    await submitPromise;
    expect(window.alert).toHaveBeenCalled();
  });
});
