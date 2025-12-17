import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PacientesComponent } from './pacientes.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ReactiveFormsModule } from '@angular/forms'; // Necesario por el FormBuilder en el constructor
import { RouterTestingModule } from '@angular/router/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { environment } from '../../enviroments/enviroment';

describe('PacientesComponent', () => {
  let component: PacientesComponent;
  let fixture: ComponentFixture<PacientesComponent>;
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiLabsUrl}/api/paciente`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PacientesComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, RouterTestingModule],
      providers: [ChangeDetectorRef],
      schemas: [NO_ERRORS_SCHEMA], // Ignora el componente app-modal
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    // Seteamos un token falso para pasar la validación de headers
    localStorage.setItem('accessToken', 'fake-token');
  });

  afterEach(() => {
    // Verificamos que no queden peticiones pendientes
    httpMock.verify();
    localStorage.clear();
  });

  // --- Tests de Inicialización ---

  it('debería crearse y cargar la lista de pacientes al iniciar', fakeAsync(() => {
    // Dispara ngOnInit
    fixture.detectChanges();

    // Espera la llamada GET inicial
    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');

    // Simulamos respuesta exitosa
    const mockResponse = {
      _embedded: {
        pacienteList: [{ id: '1', nombrePaciente: 'Juan' }],
      },
    };
    req.flush(mockResponse);

    tick(); // Avanzar asincronía

    expect(component.pacientes.length).toBe(1);
    expect(component.pacientes[0].nombrePaciente).toBe('Juan');
    expect(component.loadingData).toBeFalse();
  }));

  it('debería manejar error del servidor al cargar pacientes', fakeAsync(() => {
    spyOn(console, 'error'); // Espiar consola para que no ensucie el output
    fixture.detectChanges();

    const req = httpMock.expectOne(API_URL);
    req.flush('Error interno', { status: 500, statusText: 'Server Error' });

    tick();

    expect(console.error).toHaveBeenCalled();
    expect(component.pacientes).toEqual([]); // La lista queda vacía
  }));

  // --- Tests de updatePaciente (PUT) ---

  it('updatePaciente no debería hacer nada si no hay paciente seleccionado', async () => {
    spyOn(console, 'error');
    component.selectedPaciente = null;

    await component.updatePaciente();

    expect(console.error).toHaveBeenCalledWith('No hay paciente seleccionado para actualizar');
  });

  it('updatePaciente debería enviar petición PUT y recargar la tabla', fakeAsync(() => {
    // 1. Configurar estado inicial
    const pacienteMock = {
      id: '123',
      rut: '1-9',
      nombrePaciente: 'Ana',
      apellidoPaciente: 'Gomez',
      edad: 30,
      dv: '9',
      telefono: '555',
    };
    component.selectedPaciente = pacienteMock;

    // Ejecutar acción
    component.updatePaciente();

    // 2. Verificar llamada PUT
    const reqPut = httpMock.expectOne(`${API_URL}/123`);
    expect(reqPut.request.method).toBe('PUT');
    expect(reqPut.request.body).toEqual(pacienteMock);
    reqPut.flush({}); // Responder éxito

    tick(); // Procesar respuesta PUT

    // 3. Verificar que automáticamente llama a getAllPacientes (GET)
    const reqGet = httpMock.expectOne(API_URL);
    expect(reqGet.request.method).toBe('GET');
    reqGet.flush({ _embedded: { pacienteList: [pacienteMock] } });

    tick();

    expect(component.loadingData).toBeFalse();
  }));

  it('updatePaciente debería mostrar alerta si falla la petición', fakeAsync(() => {
    spyOn(window, 'alert'); // Espiar alert del navegador
    spyOn(console, 'error');

    component.selectedPaciente = { id: '999' };
    component.updatePaciente();

    const reqPut = httpMock.expectOne(`${API_URL}/999`);
    reqPut.flush('Error update', { status: 400, statusText: 'Bad Request' });

    tick();

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
    expect(component.loadingData).toBeFalse();
  }));

  // --- Tests de deletePaciente (DELETE) ---

  it('deletePaciente no debería hacer nada si el ID es inválido', async () => {
    spyOn(console, 'error');
    await component.deletePaciente('');
    expect(console.error).toHaveBeenCalledWith('ID inválido para eliminar');
  });

  it('deletePaciente debería enviar petición DELETE y recargar la tabla', fakeAsync(() => {
    component.deletePaciente('id-borrar');

    // 1. Espera DELETE
    const reqDelete = httpMock.expectOne(`${API_URL}/id-borrar`);
    expect(reqDelete.request.method).toBe('DELETE');
    reqDelete.flush({}); // Respuesta vacía (204 No Content)

    tick();

    // 2. Espera recarga (GET)
    const reqGet = httpMock.expectOne(API_URL);
    expect(reqGet.request.method).toBe('GET');
    reqGet.flush({});
  }));

  it('deletePaciente debería mostrar alerta si falla', fakeAsync(() => {
    spyOn(window, 'alert');
    component.deletePaciente('id-error');

    const reqDelete = httpMock.expectOne(`${API_URL}/id-error`);
    reqDelete.flush('Error delete', { status: 403, statusText: 'Forbidden' });

    tick();

    expect(window.alert).toHaveBeenCalled();
  }));

  // --- Tests de Lógica de Modal y Auth ---

  it('debería abrir y cerrar el modal correctamente', () => {
    const paciente = { id: '1' } as any;

    // Abrir
    component.openModal('edit', paciente);
    expect(component.isModalOpen).toBeTrue();
    expect(component.modalMode).toBe('edit');
    expect(component.selectedPaciente).toBe(paciente);

    // Cerrar
    component.closeModal();
    expect(component.isModalOpen).toBeFalse();
    expect(component.selectedPaciente).toBeNull();
  });

  it('confirmAction debería llamar a deletePaciente si el modo es delete', () => {
    // Espiamos el método deletePaciente para verificar que se llame
    spyOn(component, 'deletePaciente');

    component.selectedPaciente = { id: '555' };
    component.modalMode = 'delete';

    component.confirmAction();

    expect(component.deletePaciente).toHaveBeenCalledWith('555');
    expect(component.isModalOpen).toBeFalse(); // Debe cerrar el modal
  });

  it('confirmAction debería llamar a updatePaciente si el modo es edit', () => {
    spyOn(component, 'updatePaciente');

    component.selectedPaciente = { id: '555' };
    component.modalMode = 'edit';

    component.confirmAction();

    expect(component.updatePaciente).toHaveBeenCalled();
    expect(component.isModalOpen).toBeFalse();
  });

});
