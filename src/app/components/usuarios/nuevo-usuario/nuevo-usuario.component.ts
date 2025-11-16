import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validarCorreo } from 'src/app/validators/validatorFn';
import { CrearUsuarioDTO } from 'src/app/dto/usuario/CrearUsuarioDTO';
import { UsuarioService } from 'src/app/services/domainServices/usuario.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-usuario',
  templateUrl: './nuevo-usuario.component.html',
  styleUrls: ['./nuevo-usuario.component.css']
})
export class NuevoUsuarioComponent {

  protected formulario!: FormGroup;
  private formBuilder: FormBuilder = inject(FormBuilder);
  private usuarioService: UsuarioService = inject(UsuarioService);
  private router: Router = inject(Router);

  ngOnInit(): void {
    this.formulario = this.formBuilder.group({
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, validarCorreo()]],
      contrasenia: ['', [Validators.required, Validators.minLength(4)]],
      confirmarContrasenia: ['', [Validators.required]],
      rol: ['USER', [Validators.required]]
    });
  }

  async onSubmit() {
    if (!this.formulario.valid) {
      this.marcarCamposComoTocados();
      return;
    }

    const { nombre, email, contrasenia, confirmarContrasenia, rol } = this.formulario.value;

    // Validar que las contraseñas coincidan
    if (contrasenia !== confirmarContrasenia) {
      this.formulario.get('confirmarContrasenia')!.setErrors({ noCoinciden: true });
      return;
    }

    const usuario = new CrearUsuarioDTO();
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.contrasenia = contrasenia;
    usuario.rol = rol;

    try {
      await this.usuarioService.crearUsuario(usuario);
      this.formulario.reset();
      this.router.navigate(['/app/usuario']);
    } catch (error) {
      console.error('Error al crear usuario:', error);
    }
  }

  /**
   * Marca todos los controles del formulario como tocados.
   */
  private marcarCamposComoTocados(): void {
    Object.values(this.formulario.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /**
   * Cancela la creación y vuelve a la lista de usuarios
   */
  protected cancelar(): void {
    this.router.navigate(['/app/usuario']);
  }
}
