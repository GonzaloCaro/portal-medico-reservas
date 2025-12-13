import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../enviroments/enviroment';
import { IAsignacionDTO } from '../../services/interfaces/asignacion.dto';
import { ILaboratorio } from '../../services/interfaces/laboratorio.interface';
import { IAnalisis } from '../../services/interfaces/analisis.interface';
import { IPaciente } from '../../services/interfaces/paciente.interface';

@Component({
  standalone: false,
  selector: 'app-form-reservas',
  templateUrl: './form_reservas.component.html',
  styleUrls: ['./form_reservas.component.css'],
})
export class FormReservasComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiLabsUrl}/api`;

  loadingData: boolean = false;
  reserfaForm!: FormGroup;

  // Variable para controlar la vista del formulario
  esNuevoPaciente: boolean = false;

  // Listas para los dropdowns (deberías llenarlas llamando a tus APIs)
  laboratorios: any[] = [];
  analisis: any[] = [];
  pacientes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadLabsAndAnalisis();
    this.getAllPacientes(); // Cargar laboratorios y análisis
    this.cdr.detectChanges();
  }

  private initForm(): void {
    this.reserfaForm = this.fb.group({
      laboratorioId: ['', [Validators.required]],
      analisisId: ['', [Validators.required]],
      detalle: ['', [Validators.required]],
      fechaAsignacion: [new Date().toISOString().slice(0, 16), [Validators.required]], // Fecha actual por defecto

      // Control para alternar lógica
      crearNuevoPaciente: [false],

      // Opción A: Paciente Existente
      pacienteId: [''],

      // Opción B: Paciente Nuevo
      rut: [''],
      dv: [''],
      edad: [''],
      nombrePaciente: [''],
      apellidoPaciente: [''],
      telefono: [''],
    });

    // Escuchar cambios en el checkbox de nuevo paciente
    this.reserfaForm.get('crearNuevoPaciente')?.valueChanges.subscribe((val) => {
      this.esNuevoPaciente = val;
      this.updateValidators();
    });
  }

  // Actualiza validadores según si se crea paciente o se selecciona uno
  private updateValidators() {
    const pacienteIdControl = this.reserfaForm.get('pacienteId');
    const camposNuevo = ['rut', 'dv', 'edad', 'nombrePaciente', 'apellidoPaciente', 'telefono'];

    if (this.esNuevoPaciente) {
      pacienteIdControl?.clearValidators();
      pacienteIdControl?.setValue(null);
      camposNuevo.forEach((field) =>
        this.reserfaForm.get(field)?.setValidators(Validators.required)
      );
    } else {
      pacienteIdControl?.setValidators(Validators.required);
      camposNuevo.forEach((field) => {
        const control = this.reserfaForm.get(field);
        control?.clearValidators();
        control?.setValue('');
      });
    }
    pacienteIdControl?.updateValueAndValidity();
    camposNuevo.forEach((field) => this.reserfaForm.get(field)?.updateValueAndValidity());
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('accessToken');
    if (!token) return new HttpHeaders();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    });
  }

  private async loadLabsAndAnalisis() {
    const headers = this.getAuthHeaders();
    let options = { headers: headers };

    try {
      const laboratorioResponse = await this.http
        .get<any>(`${this.API_BASE_URL}/laboratorios`, options)
        .toPromise();
      this.laboratorios = laboratorioResponse?._embedded?.laboratorioList || [];
      const analisisResponse = await this.http
        .get<any>(`${this.API_BASE_URL}/analisis`, options)
        .toPromise();
      this.analisis = analisisResponse?._embedded?.analisisList || [];

      console.log('Laboratorios cargados:', this.laboratorios);
      console.log('Análisis cargados:', this.analisis);

      // Mapear solo los campos necesarios
      this.laboratorios = this.laboratorios.map((lab: ILaboratorio) => ({
        id: lab.id,
        nombre: lab.nombre,
      }));
      this.analisis = this.analisis.map((ana: IAnalisis) => ({
        id: ana.id,
        nombre: ana.nombre,
      }));
      console.log('Laboratorios mapeados:', this.laboratorios);
      console.log('Análisis mapeados:', this.analisis);
    } catch (error) {
      this.laboratorios = [{ id: 'uuid-lab-1', nombre: 'Lab Central Prueba' }];
      this.analisis = [{ id: 'uuid-ana-1', nombre: 'Sangre Completo Prueba' }];
    }
  }

  async getAllPacientes(): Promise<IPaciente[]> {
    const headers = this.getAuthHeaders();
    let options = { headers: headers };

    try {
      const pacienteResponse = await this.http
        .get<any>(`${this.API_BASE_URL}/paciente`, options)
        .toPromise();
      this.pacientes = pacienteResponse?._embedded?.pacienteList || [];
      console.log('Pacientes cargados:', this.pacientes);
    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
    }
    return this.pacientes;
  }

  // OBTENER ID DEL USUARIO LOGUEADO
  private getLoggedUserId(): string | null {
    const sesionStr = localStorage.getItem('sesion');
    if (!sesionStr) return null;
    const sesion = JSON.parse(sesionStr);
    return sesion.userId;
  }

  async onSubmit() {
    if (this.reserfaForm.invalid) {
      this.reserfaForm.markAllAsTouched();
      return;
    }

    const userId = this.getLoggedUserId();
    if (!userId) {
      alert('Error: No se pudo identificar al usuario. Inicia sesión nuevamente.');
      return;
    }

    this.loadingData = true;
    const formValues = this.reserfaForm.value;

    // Construir el DTO
    const payload: IAsignacionDTO = {
      laboratorioId: formValues.laboratorioId,
      analisisId: formValues.analisisId,
      usuarioId: userId, // ID inyectado automáticamente
      detalle: formValues.detalle,
      fechaAsignacion: formValues.fechaAsignacion,

      // Enviar pacienteId solo si no es nuevo paciente
      pacienteId: this.esNuevoPaciente ? null : formValues.pacienteId,

      // Enviar datos personales solo si es nuevo paciente
      rut: this.esNuevoPaciente ? formValues.rut : undefined,
      dv: this.esNuevoPaciente ? formValues.dv : undefined,
      edad: this.esNuevoPaciente ? formValues.edad : 0,
      nombrePaciente: this.esNuevoPaciente ? formValues.nombrePaciente : undefined,
      apellidoPaciente: this.esNuevoPaciente ? formValues.apellidoPaciente : undefined,
      telefono: this.esNuevoPaciente ? formValues.telefono : undefined,
    };

    const headers = this.getAuthHeaders();

    try {
      const response = await this.http.post(`${this.API_BASE_URL}/asignacion_lab`, payload, { headers }).toPromise();
      console.log('Reserva creada:', response);
      alert('Reserva creada con éxito');
      this.router.navigate(['/reservas']); // Redirigir
    } catch (error) {
      console.error('Error creando reserva:', error);
      alert('Ocurrió un error al crear la reserva');
    } finally {
      this.loadingData = false;
    }
  }
}
