import { IAnalisis } from './analisis.interface';
import { ILaboratorio } from './laboratorio.interface';
import { IPaciente } from './paciente.interface';

export interface IReserva {
  id: string;
  laboratorio: ILaboratorio;
  analisis: IAnalisis;
  paciente: IPaciente;
  usuarioId: string;
  fechaAsignacion: string;
  detalle: string;
  laboratorioId: string;
  analisisId: string;
  pacienteId: string;
}
