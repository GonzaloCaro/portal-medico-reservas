export interface IAsignacionDTO {
  id?: string;
  laboratorioId: string;
  usuarioId: string;
  analisisId: string;
  detalle: string;
  fechaAsignacion: string;

  // En caso de editar una reserva existente o asignar a un paciente existente
  pacienteId?: string | null;

  // Datos para nuevo paciente
  rut?: string;
  dv?: string;
  edad?: number;
  nombrePaciente?: string;
  apellidoPaciente?: string;
  telefono?: string;
}
