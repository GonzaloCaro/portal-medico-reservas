import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReservasComponent } from './reservas.component';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { environment } from '../../enviroments/enviroment';
import { vi } from 'vitest';
import { Router } from '@angular/router';

describe('ReservasComponent', () => {
  let component: ReservasComponent;
  let fixture: ComponentFixture<ReservasComponent>;
  let httpMock: HttpTestingController;
  let cdr: ChangeDetectorRef;

  const API_URL = `${environment.apiLabsUrl}/api/asignacion_lab`;
  const UUID = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(async () => {
    const cdrMock = { detectChanges: vi.fn() };

    await TestBed.configureTestingModule({
      declarations: [ReservasComponent],
      imports: [HttpClientTestingModule],
      providers: [
        FormBuilder,
        { provide: Router, useValue: {} },
        { provide: ChangeDetectorRef, useValue: cdrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReservasComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    cdr = TestBed.inject(ChangeDetectorRef);

    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  // 🔹 Helper correcto
  function mockLocalStorage(sesion: any | null, token: string | null = null) {
    vi.spyOn(localStorage, 'getItem').mockImplementation((key: string) => {
      if (key === 'sesion') return sesion ? JSON.stringify(sesion) : null;
      if (key === 'accessToken') return token;
      return null;
    });
  }

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit debe cargar reservas y cambiar loadingData', async () => {
  localStorage.setItem('accessToken', 'token-test');
  localStorage.setItem('sesion', JSON.stringify({ userId: UUID }));

  const initPromise = component.ngOnInit();

  const req = httpMock.expectOne(`${API_URL}/usuario/${UUID}`);
  expect(req.request.method).toBe('GET');
  req.flush([]);

  await initPromise;

  expect(component.loadingData).toBe(false);
  expect(component.reservas).toEqual([]);
});

  it('getAuthHeaders debe retornar headers con token', () => {
  localStorage.setItem('accessToken', 'token123');

  const headers = (component as any).getAuthHeaders();

  expect(headers.get('Authorization')).toBe('Bearer token123');
  expect(headers.get('Content-Type')).toBe('application/json');
});

  it('getAuthHeaders debe retornar headers vacíos si no hay token', () => {
    mockLocalStorage(null, null);

    const headers = (component as any).getAuthHeaders();

    expect(headers.keys().length).toBe(0);
  });

  it('getReservasByUserId debe retornar [] si no hay sesión', async () => {
    mockLocalStorage(null, 'token');

    const result = await component.getReservasByUserId();

    expect(result).toEqual([]);
    expect(component.reservas).toEqual([]);
  });

  it('getReservasByUserId debe cargar reservas correctamente', async () => {
  localStorage.setItem('accessToken', 'token-test');
  localStorage.setItem('sesion', JSON.stringify({ userId: UUID }));

  const reservasMock = [{ id: 1, nombre: 'Reserva test' }] as any;

  const promise = component.getReservasByUserId();

  const req = httpMock.expectOne(`${API_URL}/usuario/${UUID}`);
  expect(req.request.headers.get('Authorization')).toBe('Bearer token-test');
  req.flush(reservasMock);

  const result = await promise;

  expect(result).toEqual(reservasMock);
  expect(component.reservas).toEqual(reservasMock);
});

  it('getReservasByUserId debe manejar error HTTP y dejar reservas vacías', async () => {
  localStorage.setItem('accessToken', 'token-test');
  localStorage.setItem('sesion', JSON.stringify({ userId: UUID }));

  const promise = component.getReservasByUserId();

  const req = httpMock.expectOne(`${API_URL}/usuario/${UUID}`);
  req.error(new ErrorEvent('Network error'));

  const result = await promise;

  expect(result).toEqual([]);
  expect(component.reservas).toEqual([]);
});
});
