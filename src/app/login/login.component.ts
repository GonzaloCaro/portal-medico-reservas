import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Componente de inicio de sesión
 *
 * Este componente maneja la autenticación de usuarios mediante un formulario reactivo
 * que valida credenciales contra los usuarios registrados en localStorage.
 *
 * @example
 * <!-- Uso básico -->
 * <app-login></app-login>
 *
 * @example
 * <!-- Uso con redirección personalizada -->
 * <app-login (onSuccess)="handleLoginSuccess()"></app-login>
 */
@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  /**
   * Formulario reactivo para el login
   * @type {FormGroup}
   */
  loginForm!: FormGroup;

  /**
   * Indica si hubo un error en el login
   * @type {boolean}
   * @default false
   */
  error: boolean = false;

  /**
   * Constructor del componente
   * @param fb Servicio para construir formularios reactivos
   * @param router Servicio para navegación entre rutas
   * @param auth Servicio de autenticación
   */
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService
  ) {}

  /**
   * Inicializa el componente y configura el formulario
   */
  ngOnInit(): void {
    this.initializeForm();
  }

  /**
   * Configura el formulario reactivo con validaciones
   * @private
   */
  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  /**
   * Getter para acceder fácilmente a los controles del formulario
   * @returns Los controles del formulario
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Maneja el proceso de autenticación
   *
   * Valida el formulario y verifica las credenciales contra los usuarios registrados.
   * Redirige según el tipo de usuario (admin o usuario normal) en caso de éxito.
   *
   * @throws Establece this.error = true si las credenciales son inválidas
   */
  login(): void {
    this.error = false;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.value;
    this.authenticateUser(email, password);
  }

  /**
   * Autentica al usuario con las credenciales proporcionadas
   * @param email Correo electrónico del usuario
   * @param password Contraseña del usuario
   * @private
   */
  private authenticateUser(email: string, password: string): void {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(
      (u: any) => u.email === email && u.password === password
    );

    if (usuario) {
      this.handleSuccessfulLogin(usuario);
    } else {
      this.error = true;
    }
  }

  /**
   * Maneja el flujo posterior a un login exitoso
   * @param usuario Datos del usuario autenticado
   * @private
   */
  private handleSuccessfulLogin(usuario: any): void {
    localStorage.setItem(
      'sesion',
      JSON.stringify({
        logueado: true,
        usuario: usuario.usuario,
        tipo: usuario.tipo || 'usuario',
        email: usuario.email,
      })
    );

    window.location.href = usuario.tipo === 'admin' ? '/admin' : '/perfil';
  }
}
