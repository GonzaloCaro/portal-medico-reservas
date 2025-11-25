import { Component, OnInit } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

/**
 * Componente para mostrar y gestionar el perfil de usuario
 * @selector app-perfil
 * @templateUrl ./perfil.component.html
 * @styleUrls ['./perfil.component.css']
 */
@Component({
  standalone: false,
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css'],
})
export class PerfilComponent implements OnInit {
  private readonly API_BASE_URL = `${environment.apiAuthUrl}/api/usuarios`;

  constructor(private http: HttpClient, private auth: AuthService) {}

  sesion: any = null;
  usuarios: any[] = [];
  mensaje = '';

  ngOnInit(): void {
    const sesionStr = localStorage.getItem('sesion');
    this.sesion = sesionStr ? JSON.parse(sesionStr) : null;

    const usuariosStr = localStorage.getItem('usuarios');
    this.usuarios = usuariosStr ? JSON.parse(usuariosStr) : [];

    // Buscar usuario completo y sincronizar
    const usuarioEncontrado = this.usuarios.find((u) => u.usuario === this.sesion.usuario);
    if (usuarioEncontrado) {
      this.sesion = { ...usuarioEncontrado };
    }
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

  guardarCambios() {
    this.mensaje = '';

    const userId = this.sesion?.userId;
    if (!userId) {
      this.mensaje = '❌ Error: ID de usuario no encontrado.';
      return;
    }

    const updateBody = {
      nombre: this.sesion.nombre,
      apellido: this.sesion.apellido,
      userName: this.sesion.usuario,
      email: this.sesion.email,
    };

    const url = `${this.API_BASE_URL}/${userId}`;
    const headers = this.getAuthHeaders();

    this.http.put(url, updateBody, { headers }).subscribe({
      next: (response) => {
        console.log('Usuario actualizado:', response);
        localStorage.setItem('sesion', JSON.stringify(this.sesion));
        this.mensaje = 'Cambios guardados correctamente.';
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.mensaje = `Error al guardar: ${err.statusText || 'Verifique la conexión.'}`;
      },
    });
  }
}
