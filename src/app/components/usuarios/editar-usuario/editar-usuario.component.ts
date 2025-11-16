import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validarCorreo } from '../../../validators/validatorFn';
import { ActualizarUsuarioDTO } from '../../../dto/usuario/ActualizarUsuarioDTO';
import { AlertService } from 'src/app/utils/alert.service';
import { UsuarioDTO } from '../../../dto/usuario/UsuarioDTO';
import { UsuarioService } from 'src/app/services/domainServices/usuario.service';

@Component({
  selector: 'app-editar-usuario',
  templateUrl: './editar-usuario.component.html',
  styleUrls: ['./editar-usuario.component.css']
})
export class EditarUsuarioComponent {

  @Input() usuarioEditar!: UsuarioDTO;
  @Output() modoOculto = new EventEmitter();
  protected usuarioForm!: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private usuarioService: UsuarioService = inject(UsuarioService);
  private alert: AlertService = inject(AlertService);

  public ngOnInit(): void {
    this.formBuild();
  }

  private formBuild(): void {
    this.usuarioForm = this.fb.group({
      id: '',
      nombre: ['', [Validators.required]],
      email: ['', [Validators.required, validarCorreo()]],
      contrasenia: ['', [Validators.minLength(4)]]
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['usuarioEditar'] && this.usuarioEditar && this.usuarioForm) {
      this.usuarioForm.patchValue({
        id: this.usuarioEditar.id,
        nombre: this.usuarioEditar.nombre,
        email: this.usuarioEditar.email,
        contrasenia: ''
      });
    }
  }

  protected async guardar(): Promise<void> {
    if (!this.usuarioForm.valid) {
      Object.values(this.usuarioForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const { id, nombre, email, contrasenia } = this.usuarioForm.value;
    let usuario = new ActualizarUsuarioDTO();
    usuario.id = id;
    usuario.nombre = nombre;
    usuario.email = email;
    usuario.contrasenia = contrasenia || '';

    try {
      await this.usuarioService.actualizarUsuario(usuario);
      this.modoOculto.emit();
      this.usuarioForm.reset();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  }

  protected cancelar(): void {
    this.modoOculto.emit();
    this.usuarioForm.reset();
  }
}
