import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { IPaciente } from '../services/interfaces/paciente.interface';
import { CommonModule } from '@angular/common';
import { ModalMode } from '../laboratorios/laboratorios.component';

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
  isModalOpen = false;
  modalMode: ModalMode | null = null;
  selectedPaciente: any = null;

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

  async updatePaciente() {
    if (!this.selectedPaciente || !this.selectedPaciente.id) {
      console.error('No hay paciente seleccionado para actualizar');
      return;
    }

    const id = this.selectedPaciente.id;
    const url = `${this.API_BASE_URL}/${id}`;
    const headers = this.getAuthHeaders();

    const payload = {
      id: this.selectedPaciente.id,
      rut: this.selectedPaciente.rut,
      dv: this.selectedPaciente.dv,
      edad: this.selectedPaciente.edad,
      nombrePaciente: this.selectedPaciente.nombrePaciente,
      apellidoPaciente: this.selectedPaciente.apellidoPaciente,
      telefono: this.selectedPaciente.telefono
    };

    try {
      this.loadingData = true;

      await this.http.put(url, payload, { headers }).toPromise();

      console.log('Paciente actualizado correctamente');

      await this.getAllPacientes(); 
      this.closeModal();

    } catch (error) {
      console.error('Error al actualizar el paciente:', error);
      alert('Hubo un error al actualizar el paciente. Revisa la consola.');
    } finally {
      this.loadingData = false;
      this.cdr.detectChanges(); 
    }
  }

  /**
   * Envía la solicitud DELETE al backend para eliminar un paciente por su ID
   * @param id El UUID del paciente a eliminar
   */
  async deletePaciente(id: string) {
    if (!id) {
      console.error('ID inválido para eliminar');
      return;
    }

    // 1. Construir la URL con el ID (ej: .../api/paciente/123-abc...)
    const url = `${this.API_BASE_URL}/${id}`;
    const headers = this.getAuthHeaders();

    try {
      this.loadingData = true;

      // 2. Realizar la petición DELETE
      // El backend devuelve ResponseEntity<Void> (204 No Content), por lo que no esperamos un body en la respuesta
      await this.http.delete(url, { headers }).toPromise();

      console.log(`Paciente ${id} eliminado con éxito`);

      // 3. Refrescar la lista de pacientes para que desaparezca de la tabla
      await this.getAllPacientes();

    } catch (error) {
      console.error('Error al eliminar el paciente:', error);
      alert('Ocurrió un error al intentar eliminar el paciente.');
    } finally {
      this.loadingData = false;
      this.cdr.detectChanges();
    }
  }

  openModal(mode: ModalMode, paciente: IPaciente) {
    this.modalMode = mode;
    this.selectedPaciente = paciente;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    this.modalMode = null;
    this.selectedPaciente = null;
  }
  confirmAction() {
    if (!this.selectedPaciente) return;

    switch (this.modalMode) {
      case 'delete':
        this.deletePaciente(this.selectedPaciente.id); 
        break;

      case 'edit':
        this.updatePaciente();
        break;
    }

    this.closeModal();
  }

}
