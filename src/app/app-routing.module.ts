import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RecoverComponent } from './recover/recover.component';
import { PerfilComponent } from './profile/perfil.component';
import { RegisterComponent } from './register/register.component';
import { PacientesComponent } from './pacientes/pacientes.component';
import { LaboratoriosComponent } from './laboratorios/laboratorios.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegisterComponent },
  { path: 'recuperar', component: RecoverComponent },
  { path: 'perfil', component: PerfilComponent },
  { path: 'pacientes', component: PacientesComponent },
  { path: 'laboratorios', component: LaboratoriosComponent },
  // { path: 'analisis', component: AnalisisComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
