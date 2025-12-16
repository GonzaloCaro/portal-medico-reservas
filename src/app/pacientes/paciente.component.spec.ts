import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef, NO_ERRORS_SCHEMA } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { LaboratoriosComponent } from '../laboratorios/laboratorios.component';

describe('LaboratoriosComponent', () => {
  let component: LaboratoriosComponent;
  let fixture: ComponentFixture<LaboratoriosComponent>;
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiLabsUrl}/api/laboratorios`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LaboratoriosComponent],
      imports: [HttpClientTestingModule],
      providers: [ChangeDetectorRef],
      schemas: [NO_ERRORS_SCHEMA], // <--- SOLUCIÓN
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoriosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.setItem('accessToken', 'fake-token');
  });

  afterEach(() => {
    if (httpMock) {
      httpMock.verify();
    }
    localStorage.clear();
  });

  it('debería cargar laboratorios al iniciar', fakeAsync(() => {
    fixture.detectChanges();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ _embedded: { laboratorioList: [{ id: 1, nombre: 'Lab 1' }] } });

    tick();
    expect(component.laboratorios.length).toBe(1);
  }));

  it('confirmAction debería ejecutar deleteLaboratorio', () => {
    spyOn(console, 'log');
    component.selectedLaboratorio = { id: '1' };
    component.modalMode = 'delete';

    component.confirmAction();

    expect(console.log).toHaveBeenCalledWith('Eliminar laboratorio', '1');
    expect(component.isModalOpen).toBeFalse();
  });

  it('confirmAction debería ejecutar updateLaboratorio', () => {
    spyOn(console, 'log');
    const labMock: any = { id: '1', nombre: 'Test' };
    component.selectedLaboratorio = labMock;
    component.modalMode = 'edit';

    component.confirmAction();

    expect(console.log).toHaveBeenCalledWith('Editar laboratorio', labMock);
    expect(component.isModalOpen).toBeFalse();
  });

  it('should handle HTTP error in getAllLaboratorios', fakeAsync(() => {
    spyOn(console, 'error');
    component.getAllLaboratorios();

    const req = httpMock.expectOne(API_URL);
    req.flush('Error', { status: 500, statusText: 'Error' });

    tick();
    expect(console.error).toHaveBeenCalled();
  }));
});
