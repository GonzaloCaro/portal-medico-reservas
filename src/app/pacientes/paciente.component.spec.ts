import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PacientesComponent } from './pacientes.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../enviroments/enviroment';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

const pacientesMock = [
  {
    id: '1',
    rut: '12345678',
    dv: '9',
    edad: 30,
    nombrePaciente: 'Juan',
    fechaNacimiento: '1993-01-01',
    apellidoPaciente: 'Pérez',
    telefono: '123456789',
  },
];

describe('PacientesComponent', () => {
  let component: PacientesComponent;
  let fixture: ComponentFixture<PacientesComponent>;
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiLabsUrl}/api/paciente`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PacientesComponent],
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [FormBuilder],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PacientesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);

    localStorage.setItem('accessToken', 'fake-token');
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  // it('ngOnInit debería cargar pacientes y desactivar loading', async () => {
  //   component.ngOnInit();

  //   const req = httpMock.expectOne(API_URL);
  //   expect(req.request.method).toBe('GET');
  //   req.flush({ _embedded: { pacienteList: pacientesMock } });

  //   await fixture.whenStable();
  //   fixture.detectChanges();

  //   expect(component.pacientes.length).toBe(1);
  //   expect(component.loadingData).toBeFalse();
  // });

  it('getAllPacientes debería asignar pacientes', async () => {
    const resultPromise = component.getAllPacientes();

    const req = httpMock.expectOne(API_URL);
    req.flush({ _embedded: { pacienteList: pacientesMock } });

    const result = await resultPromise;

    expect(result.length).toBe(1);
    expect(component.pacientes).toEqual(pacientesMock);
  });

  // it('updatePaciente debería actualizar y recargar pacientes', async () => {
  //   component.selectedPaciente = pacientesMock[0];

  //   const promise = component.updatePaciente();

  //   const putReq = httpMock.expectOne(`${API_URL}/1`);
  //   expect(putReq.request.method).toBe('PUT');
  //   putReq.flush({});

  //   const getReq = httpMock.expectOne(API_URL);
  //   expect(getReq.request.method).toBe('GET');
  //   getReq.flush({ _embedded: { pacienteList: pacientesMock } });

  //   await promise;
  //   fixture.detectChanges();

  //   expect(component.loadingData).toBeFalse();
  //   expect(component.pacientes).toEqual(pacientesMock);
  // });

  // it('deletePaciente debería eliminar y recargar pacientes', async () => {
  //   const promise = component.deletePaciente('1');

  //   const deleteReq = httpMock.expectOne(`${API_URL}/1`);
  //   expect(deleteReq.request.method).toBe('DELETE');
  //   deleteReq.flush(null);

  //   const getReq = httpMock.expectOne(API_URL);
  //   expect(getReq.request.method).toBe('GET');
  //   getReq.flush({ _embedded: { pacienteList: [] } });

  //   await promise;
  //   fixture.detectChanges();

  //   expect(component.loadingData).toBeFalse();
  //   expect(component.pacientes.length).toBe(0);
  // });

  it('openModal debería abrir el modal', () => {
    component.openModal('edit', pacientesMock[0]);

    expect(component.isModalOpen).toBeTrue();
    expect(component.selectedPaciente).toEqual(pacientesMock[0]);
    expect(component.modalMode).toBe('edit');
  });

  it('closeModal debería cerrar el modal', () => {
    component.closeModal();

    expect(component.isModalOpen).toBeFalse();
    expect(component.modalMode).toBeNull();
    expect(component.selectedPaciente).toBeNull();
  });

  it('confirmAction debería llamar deletePaciente si el modo es delete', () => {
    spyOn(component, 'deletePaciente');
    component.modalMode = 'delete';
    component.selectedPaciente = { id: '1' };

    component.confirmAction();

    expect(component.deletePaciente).toHaveBeenCalledWith('1');
  });

  it('confirmAction debería llamar updatePaciente si el modo es edit', () => {
    spyOn(component, 'updatePaciente');
    component.modalMode = 'edit';
    component.selectedPaciente = pacientesMock[0];

    component.confirmAction();

    expect(component.updatePaciente).toHaveBeenCalled();
  });
});
