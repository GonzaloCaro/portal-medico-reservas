import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ILaboratorio } from '../services/interfaces/laboratorio.interface';

type ModalMode = 'view' | 'edit' | 'delete';

@Component({
  standalone: false,
  selector: 'app-laboratorios',
  templateUrl: './laboratorios.component.html',
  styleUrls: ['./laboratorios.component.css'],
})
export class LaboratoriosComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiLabsUrl}/api/laboratorios`;

  loadingData: boolean = true;
  laboratorios: ILaboratorio[] = [];
  isModalOpen = false;
  modalMode: ModalMode | null = null;
  selectedLaboratorio: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingData = true;
    await this.getAllLaboratorios();
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

  async getAllLaboratorios(): Promise<ILaboratorio[]> {
    const headers = this.getAuthHeaders();
    let options = { headers: headers };

    try {
      const laboratorioResponse = await this.http.get<any>(this.API_BASE_URL, options).toPromise();
      this.laboratorios = laboratorioResponse?._embedded?.laboratorioList || [];
    } catch (error) {
      console.error('Error en la solicitud HTTP:', error);
    }
    return this.laboratorios;
  }

  openModal(mode: ModalMode, laboratorio: any) {
    this.modalMode = mode;
    this.selectedLaboratorio = laboratorio;
    this.isModalOpen = true;
  }
  closeModal() {
    this.isModalOpen = false;
    this.modalMode = null;
    this.selectedLaboratorio = null;
  }
  confirmAction() {
    if (!this.selectedLaboratorio) return;

    switch (this.modalMode) {
      case 'delete':
        this.deleteLaboratorio(this.selectedLaboratorio.id);
        break;

      case 'edit':
        this.updateLaboratorio();
        break;
    }

    this.closeModal();
  }

  /* Ejemplos */
  deleteLaboratorio(id: string) {
    console.log('Eliminar laboratorio', id);
  }

  updateLaboratorio() {
    console.log('Editar laboratorio', this.selectedLaboratorio);
  }
}
