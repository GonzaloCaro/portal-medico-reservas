import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { environment } from '../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: false,
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit {
  private readonly AUTH_URL = `${environment.apiAuthUrl}/api/auth/login`;

  loginForm!: FormGroup;
  error: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private auth: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      user_name: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  login(): void {
    this.error = false;

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { user_name, password } = this.loginForm.value;
    this.authenticateUser(user_name, password);
  }

  private authenticateUser(user_name: string, password: string): void {
    const body = {
      userName: user_name,
      password: password,
    };

    const httpOptions = {
      headers: { 'Content-Type': 'application/json' },
      withCredentials: true,
    };

    this.http.post<any>(this.AUTH_URL, body, httpOptions).subscribe({
      next: (response) => {
        console.log('Login exitoso:', response);
        this.handleSuccessfulLogin(response);
      },
      error: (err) => {
        console.error('Login fallido:', err);
        this.error = true;
      },
    });
  }

  private handleSuccessfulLogin(response: any): void {
    localStorage.setItem('accessToken', response.accessToken);

    localStorage.setItem(
      'sesion',
      JSON.stringify({
        logueado: true,
        tipo: response.roleNombre,
        userId: response.userId,
        userName: response.userName,
        nombre: response.nombre,
        apellido: response.apellido,
        email: response.email,
        token: response.accessToken,
      })
    );

    const userType = response.roleNombre;
    const redirectUrl = '/';
    this.router.navigate([redirectUrl]);
  }

  togglePasswordVisibility(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput) {
      passwordInput.type = passwordInput.type === 'password' ? 'text' : 'password';
    }
  }
}
