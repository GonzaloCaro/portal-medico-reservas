import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private sesionSubject = new BehaviorSubject<any>(this.getSesion());

  sesion$ = this.sesionSubject.asObservable();

  constructor() {}

  getSesion(): any {
    const sesion = localStorage.getItem('sesion');
    return sesion ? JSON.parse(sesion) : null;
  }

  estaLogueado(): boolean {
    const sesion = this.getSesion();
    return sesion?.logueado || false;
  }

  esAdmin(): boolean {
    const sesion = this.getSesion();
    return sesion?.tipo === 'admin';
  }

  cerrarSesion(): void {
    localStorage.removeItem('sesion');
    this.sesionSubject.next(null);
  }

  iniciarSesion(sesionData: any): void {
    localStorage.setItem('sesion', JSON.stringify(sesionData));
    this.sesionSubject.next(sesionData);
  }
}
