import { NgbCollapseModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from './navbar/navbar.component';
import { RecoverComponent } from './recover/recover.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PerfilComponent } from './profile/perfil.component';
import { HttpClientModule } from '@angular/common/http';
import { ReservasComponent } from './reservas/reservas.component';
import { HomeComponent } from './home/home.component';
import { PacientesComponent } from './pacientes/pacientes.component';
import { CommonModule } from '@angular/common';
import { LaboratoriosComponent } from './laboratorios/laboratorios.component';
import { FormReservasComponent } from './reservas/form_reservas/form_reservas.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    RecoverComponent,
    LoginComponent,
    RegisterComponent,
    PerfilComponent,
    HomeComponent,
    ReservasComponent,
    FormReservasComponent,
    PacientesComponent,
    LaboratoriosComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    NgbCollapseModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
