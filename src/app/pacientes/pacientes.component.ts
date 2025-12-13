import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPaciente } from '../services/interfaces/paciente.interface';
import { CommonModule } from '@angular/common';

@Component({
  standalone: false,
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.css'],
})
export class PacientesComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiLabsUrl}/api/paciente`;

  loadingData: boolean = true;
  pacientes: IPaciente[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingData = true;
    await this.getAllPacientes();
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

  async getAllPacientes(): Promise<IPaciente[]> {
    const headers = this.getAuthHeaders();
    let options = { headers: headers };

    try {
      const pacienteResponse = await this.http.get<any>(this.API_BASE_URL, options).toPromise();
      this.pacientes = pacienteResponse?._embedded?.pacienteList || [];
      console.log('Pacientes cargados:', this.pacientes);
    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
    }
    return this.pacientes;
  }
}
