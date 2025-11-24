import { Component, OnInit } from '@angular/core';

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
  /**
   * Objeto que contiene los datos de la sesión actual del usuario
   * @type {any}
   */
  sesion: any = null;

  /**
   * Array que contiene todos los usuarios registrados
   * @type {any[]}
   */
  usuarios: any[] = [];

  /**
   * Mensaje para mostrar feedback al usuario
   * @type {string}
   */
  mensaje = '';

  /**
   * Método del ciclo de vida de Angular que se ejecuta al inicializar el componente
   * @method ngOnInit
   * @returns {void}
   */
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

  /**
   * Guarda los cambios realizados en el perfil del usuario
   * Actualiza los datos en localStorage y muestra un mensaje de confirmación
   * @method guardarCambios
   * @returns {void}
   */
  guardarCambios() {
    const index = this.usuarios.findIndex((u) => u.usuario === this.sesion.usuario);
    if (index !== -1) {
      this.usuarios[index] = { ...this.sesion };
      localStorage.setItem('usuarios', JSON.stringify(this.usuarios));
      this.mensaje = '✅ Cambios guardados correctamente.';
    }
  }
}
