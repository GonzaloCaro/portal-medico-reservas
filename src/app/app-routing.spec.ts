import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { RecoverComponent } from './recover/recover.component';
import { PerfilComponent } from './profile/perfil.component';
import { PacientesComponent } from './pacientes/pacientes.component';
import { LaboratoriosComponent } from './laboratorios/laboratorios.component';
import { ReservasComponent } from './reservas/reservas.component';
import { FormReservasComponent } from './reservas/form_reservas/form_reservas.component';

describe('AppRoutingModule', () => {
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppRoutingModule],
    });
    router = TestBed.inject(Router);
  });

  it('debería inicializarse correctamente', () => {
    expect(router).toBeTruthy();
  });

  it('debería tener la ruta "" redirigiendo a HomeComponent', () => {
    const route = router.config.find((r) => r.path === '');
    expect(route).toBeDefined();
    expect(route?.component).toBe(HomeComponent);
  });

  it('debería tener la ruta "login" redirigiendo a LoginComponent', () => {
    const route = router.config.find((r) => r.path === 'login');
    expect(route).toBeDefined();
    expect(route?.component).toBe(LoginComponent);
  });

  it('debería tener la ruta "registro" redirigiendo a RegisterComponent', () => {
    const route = router.config.find((r) => r.path === 'registro');
    expect(route).toBeDefined();
    expect(route?.component).toBe(RegisterComponent);
  });

  it('debería tener la ruta "recuperar" redirigiendo a RecoverComponent', () => {
    const route = router.config.find((r) => r.path === 'recuperar');
    expect(route).toBeDefined();
    expect(route?.component).toBe(RecoverComponent);
  });

  it('debería tener la ruta "perfil" redirigiendo a PerfilComponent', () => {
    const route = router.config.find((r) => r.path === 'perfil');
    expect(route).toBeDefined();
    expect(route?.component).toBe(PerfilComponent);
  });

  it('debería tener la ruta "pacientes" redirigiendo a PacientesComponent', () => {
    const route = router.config.find((r) => r.path === 'pacientes');
    expect(route).toBeDefined();
    expect(route?.component).toBe(PacientesComponent);
  });

  it('debería tener la ruta "laboratorios" redirigiendo a LaboratoriosComponent', () => {
    const route = router.config.find((r) => r.path === 'laboratorios');
    expect(route).toBeDefined();
    expect(route?.component).toBe(LaboratoriosComponent);
  });

  it('debería tener la ruta "reservas" redirigiendo a ReservasComponent', () => {
    const route = router.config.find((r) => r.path === 'reservas');
    expect(route).toBeDefined();
    expect(route?.component).toBe(ReservasComponent);
  });

  it('debería tener la ruta "create-reserva" redirigiendo a FormReservasComponent', () => {
    const route = router.config.find((r) => r.path === 'create-reserva');
    expect(route).toBeDefined();
    expect(route?.component).toBe(FormReservasComponent);
  });

  it('debería redirigir rutas desconocidas ("**") a "" (Home)', () => {
    const route = router.config.find((r) => r.path === '**');
    expect(route).toBeDefined();
    expect(route?.redirectTo).toBe('');
  });
});
