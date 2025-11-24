import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RecoverComponent } from './recover/recover.component';
import { PerfilComponent } from './profile/perfil.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  // { path: 'registro', component: RegisterComponent },
  { path: 'recuperar', component: RecoverComponent },
  { path: 'perfil', component: PerfilComponent },
  // rutas futuras:
  // { path: 'perfil', component: PerfilComponent },
  // { path: 'carrito', component: CarritoComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
