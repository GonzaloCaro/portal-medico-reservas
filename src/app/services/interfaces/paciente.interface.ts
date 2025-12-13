export interface IPaciente {
  id: string;
  rut: string;
  dv: string;
  nombrePaciente: string;
  apellidoPaciente: string;
  fechaNacimiento: string;
  telefono: string;
  genero?: string;
  edad?: number;
  email?: string;
  direccion?: string;
}
