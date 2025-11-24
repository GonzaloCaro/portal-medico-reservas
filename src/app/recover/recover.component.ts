import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

/**
 * Componente para recuperación de contraseña
 * Permite a los usuarios recuperar su contraseña proporcionando su email
 * @selector app-recover
 * @templateUrl ./recover.component.html
 * @styleUrls ['./recover.component.css']
 */
@Component({
  standalone: false,
  selector: 'app-recover',
  templateUrl: './recover.component.html',
  styleUrls: ['./recover.component.css'],
})
export class RecoverComponent implements OnInit {
  /**
   * Formulario reactivo para la recuperación de contraseña
   * @type {FormGroup}
   */
  recoverForm!: FormGroup;

  /**
   * Mensaje para mostrar información al usuario cuando la recuperación es exitosa
   * @type {string}
   */
  mensaje = '';

  /**
   * Mensaje para mostrar errores durante el proceso de recuperación
   * @type {string}
   */
  error = '';

  /**
   * Constructor del componente
   * @constructor
   * @param {FormBuilder} fb - Servicio para crear formularios reactivos
   */
  constructor(private fb: FormBuilder) {}

  /**
   * Inicializa el componente y configura el formulario con validaciones
   * @method ngOnInit
   * @returns {void}
   */
  ngOnInit(): void {
    // Inicialización del formulario con validación de email
    this.recoverForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  /**
   * Intenta recuperar la contraseña del usuario
   * Verifica el email ingresado y muestra la contraseña si el usuario existe
   * @method recuperar
   * @returns {void}
   */
  recuperar() {
    this.mensaje = '';
    this.error = '';

    // Si el formulario no es válido, detener
    if (this.recoverForm.invalid) {
      this.error = 'Por favor, ingresa un correo válido.';
      return;
    }

    const emailIngresado = this.recoverForm.value.email;
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find((u: any) => u.email === emailIngresado);

    if (!usuario) {
      this.error = 'Usuario no encontrado con ese correo.';
    } else {
      this.mensaje = `Hola ${usuario.nombre}, tu contraseña es: ${usuario.password}`;
    }
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario desde el template
   * @method f
   * @returns {any} Controles del formulario
   */
  get f() {
    return this.recoverForm.controls;
  }
}
