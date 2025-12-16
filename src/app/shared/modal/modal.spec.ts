import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Modal } from './modal';
import { vi } from 'vitest';

describe('Modal', () => {
  let component: Modal;
  let fixture: ComponentFixture<Modal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Modal],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Modal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe recibir los inputs correctamente', () => {
  fixture = TestBed.createComponent(Modal);
  component = fixture.componentInstance;

  component.isOpen = true;
  component.title = 'Título de prueba';
  component.showFooter = false;

  fixture.detectChanges();

  expect(component.isOpen).toBe(true);
  expect(component.title).toBe('Título de prueba');
  expect(component.showFooter).toBe(false);
});

  it('debe emitir el evento close al ejecutar onClose()', () => {
    const spy = vi.spyOn(component.close, 'emit');

    component.onClose();

    expect(spy).toHaveBeenCalled();
  });

  it('debe emitir el evento confirm al ejecutar onConfirm()', () => {
    const spy = vi.spyOn(component.confirm, 'emit');

    component.onConfirm();

    expect(spy).toHaveBeenCalled();
  });
});
