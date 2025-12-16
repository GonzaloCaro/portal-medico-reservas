import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LaboratoriosComponent } from './laboratorios.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { environment } from '../../enviroments/enviroment';

interface ILaboratorio {
  id: string;
  nombre: string;
  ubicacion: string;
}

describe('LaboratoriosComponent', () => {
  let component: LaboratoriosComponent;
  let fixture: ComponentFixture<LaboratoriosComponent>;
  let httpMock: HttpTestingController;

  const API_URL = `${environment.apiLabsUrl}/api/laboratorios`;
  const laboratoriosMock: ILaboratorio[] = [
    { id: '1', nombre: 'Lab 1', ubicacion: 'Santiago' },
    { id: '2', nombre: 'Lab 2', ubicacion: 'Valparaíso' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LaboratoriosComponent],
      imports: [HttpClientTestingModule],
      providers: [ChangeDetectorRef],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(LaboratoriosComponent);
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

  it('getAllLaboratorios debería asignar laboratorios', async () => {
    const resultPromise = component.getAllLaboratorios();

    const req = httpMock.expectOne(API_URL);
    expect(req.request.method).toBe('GET');
    req.flush({ _embedded: { laboratorioList: laboratoriosMock } });

    const result = await resultPromise;

    expect(result.length).toBe(2);
    expect(component.laboratorios).toEqual(laboratoriosMock);
  });

  it('openModal debería abrir el modal', () => {
    component.openModal('edit', laboratoriosMock[0]);

    expect(component.isModalOpen).toBeTrue();
    expect(component.selectedLaboratorio).toEqual(laboratoriosMock[0]);
    expect(component.modalMode).toBe('edit');
  });

  it('closeModal debería cerrar el modal', () => {
    component.isModalOpen = true;
    component.modalMode = 'edit';
    component.selectedLaboratorio = laboratoriosMock[0];

    component.closeModal();

    expect(component.isModalOpen).toBeFalse();
    expect(component.modalMode).toBeNull();
    expect(component.selectedLaboratorio).toBeNull();
  });

  it('confirmAction debería llamar deleteLaboratorio si el modo es delete', () => {
    spyOn(component, 'deleteLaboratorio');
    component.modalMode = 'delete';
    component.selectedLaboratorio = laboratoriosMock[0];

    component.confirmAction();

    expect(component.deleteLaboratorio).toHaveBeenCalledWith('1');
    expect(component.isModalOpen).toBeFalse();
  });

  it('confirmAction debería llamar updateLaboratorio si el modo es edit', () => {
    spyOn(component, 'updateLaboratorio');
    component.modalMode = 'edit';
    component.selectedLaboratorio = laboratoriosMock[0];

    component.confirmAction();

    expect(component.updateLaboratorio).toHaveBeenCalled();
    expect(component.isModalOpen).toBeFalse();
  });
});
