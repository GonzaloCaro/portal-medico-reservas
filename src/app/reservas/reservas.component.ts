import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { IReserva } from '../services/interfaces/reserva.interface';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.css'],
})
export class ReservasComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiLabsUrl}/api/asignacion_lab`;

  loadingData: boolean = true;
  reservas: IReserva[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingData = true;
    await this.getReservasByUserId();
    this.loadingData = false;
    this.cdr.detectChanges();
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('Token de autenticación no encontrado.');
      return new HttpHeaders();
    }
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  async getReservasByUserId(): Promise<IReserva[]> {
    const sesionStr = localStorage.getItem('sesion');
    if (!sesionStr) {
      console.error('No se encontró sesión activa.');
      return [];
    }
    try {
      const sesionObj = JSON.parse(sesionStr);
      const userId = sesionObj.userId;
      console.log('UserID obtenido:', userId);
      if (!userId) {
        console.error('El objeto de sesión no contiene un userId.');
        return [];
      }
      const headers = this.getAuthHeaders();
      const options = { headers: headers };
      const reservasResponse = await this.http
        .get<IReserva[]>(`${this.API_BASE_URL}/usuario/${userId}`, options)
        .toPromise();

      if (reservasResponse) {
        this.reservas = reservasResponse; // Lo metemos en un array si es un solo objeto
      } else {
        this.reservas = [];
      }
      console.log('Reservas cargadas:', this.reservas);
    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
      this.reservas = [];
    }
    return this.reservas;
  }
}
