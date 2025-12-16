import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecoverComponent } from './recover.component';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';

describe('RecoverComponent', () => {
  let component: RecoverComponent;
  let fixture: ComponentFixture<RecoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RecoverComponent],
      imports: [ReactiveFormsModule],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(RecoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('debería crearse correctamente', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit debería inicializar el formulario', () => {
    component.ngOnInit();
    expect(component.recoverForm).toBeTruthy();
    expect(component.recoverForm.controls['email']).toBeTruthy();
  });

  it('debería marcar el formulario como inválido si email está vacío', () => {
    component.ngOnInit();
    component.recoverForm.controls['email'].setValue('');
    component.recuperar();
    expect(component.error).toBe('Por favor, ingresa un correo válido.');
    expect(component.mensaje).toBe('');
  });

  it('debería marcar el formulario como inválido si email tiene formato incorrecto', () => {
    component.ngOnInit();
    component.recoverForm.controls['email'].setValue('correo-invalido');
    component.recuperar();
    expect(component.error).toBe('Por favor, ingresa un correo válido.');
    expect(component.mensaje).toBe('');
  });

  it('debería mostrar error si usuario no existe', () => {
    component.ngOnInit();
    localStorage.setItem(
      'usuarios',
      JSON.stringify([{ email: 'test@correo.com', nombre: 'Test', password: '1234' }])
    );

    component.recoverForm.controls['email'].setValue('noexiste@correo.com');
    component.recuperar();

    expect(component.error).toBe('Usuario no encontrado con ese correo.');
    expect(component.mensaje).toBe('');
  });

  it('debería mostrar contraseña si usuario existe', () => {
    component.ngOnInit();
    localStorage.setItem(
      'usuarios',
      JSON.stringify([{ email: 'test@correo.com', nombre: 'Test', password: '1234' }])
    );

    component.recoverForm.controls['email'].setValue('test@correo.com');
    component.recuperar();

    expect(component.error).toBe('');
    expect(component.mensaje).toBe('Hola Test, tu contraseña es: 1234');
  });
});
