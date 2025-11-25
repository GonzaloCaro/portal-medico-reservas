import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../enviroments/enviroment';
import { HttpClient } from '@angular/common/http';

interface Option {
  id: string;
  nombre: string;
}

@Component({
  standalone: false,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  error: string = '';
  exito: string = '';

  areas: Option[] = [];
  roles: Option[] = [];

  loadingData: boolean = true;

  private readonly API_BASE_URL = environment.apiAuthUrl;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadingData = true;
    await this.cargarDatosIniciales();
    this.initializeForm();
    this.loadingData = false;
    this.cdr.detectChanges();
  }

  async cargarDatosIniciales(): Promise<any> {
    const areaReq = this.http.get<any>(`${this.API_BASE_URL}/api/areas`).toPromise();
    const rolesReq = this.http.get<any>(`${this.API_BASE_URL}/api/roles`).toPromise();

    try {
      const [areaResponse, roleResponse] = await Promise.all([areaReq, rolesReq]);

      this.roles = roleResponse?._embedded?.rolList || [];
      this.areas = areaResponse?._embedded?.areaList || [];

      console.log('Áreas cargadas:', this.areas);
      console.log('Roles cargados:', this.roles);

      if (this.areas.length === 0 || this.roles.length === 0) {
        this.error = 'No se pudo cargar la información de áreas/roles.';
      }
    } catch (err) {
      console.error('Error al cargar áreas/roles:', err);
      this.error = 'Error de conexión al cargar datos iniciales.';
    }
  }

  private initializeForm(): void {
    this.registerForm = this.fb.group(
      {
        nombre: ['', Validators.required],
        apellido: ['', Validators.required],
        usuario: ['', [Validators.required, Validators.minLength(4)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(4)]],
        password2: ['', Validators.required],

        areaId: ['', Validators.required],
        roleId: ['', Validators.required],
      },
      { validators: [this.passwordsIgualesValidator] }
    );
  }

  edadMinimaValidator(control: AbstractControl): ValidationErrors | null {
    const fecha = new Date(control.value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - fecha.getFullYear();
    const mes = hoy.getMonth() - fecha.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < fecha.getDate())) {
      edad--;
    }
    return edad < 14 ? { edadMinima: true } : null;
  }

  passwordsIgualesValidator(group: AbstractControl): ValidationErrors | null {
    const pass1 = group.get('password')?.value;
    const pass2 = group.get('password2')?.value;
    return pass1 === pass2 ? null : { contrasenasNoCoinciden: true };
  }

  registrar() {
    this.error = '';
    this.exito = '';

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.error = 'Revisa los campos, hay errores en el formulario.';
      return;
    }

    const formValues = this.registerForm.value;

    const payload = {
      nombre: formValues.nombre,
      apellido: formValues.apellido,
      userName: formValues.usuario,
      email: formValues.email,
      contrasena: formValues.password,
      areaId: formValues.areaId,
      roleId: formValues.roleId,
    };

    this.http.post(`${this.API_BASE_URL}/api/usuarios`, payload).subscribe({
      next: (response) => {
        console.log('Registro exitoso:', response);
        this.exito = 'Usuario registrado con éxito. Ahora puedes iniciar sesión.';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.error = `Error al registrar: ${err.error?.message || 'Usuario o email ya existen.'}`;
      },
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}
