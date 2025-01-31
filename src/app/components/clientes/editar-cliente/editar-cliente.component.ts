import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClientesService } from 'src/app/services/http-services/httpClientes.service';
import { soloTexto, validarCorreo } from '../../../validators/validatorFn';
import { ActualizarClienteDTO } from '../../../dto/cliente/ActualizarClienteDTO';
import { AlertService } from 'src/app/utils/alert.service';
import { ClienteDTO } from '../../../dto/cliente/ClienteDTO';
import { MenuComponent } from '../../menu/menu.component';


@Component({
  selector: 'app-editar-cliente',
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css']
})
export class EditarClienteComponent {


  @Input() personaEditar!: ClienteDTO;
  @Output() modoOculto = new EventEmitter();
  protected personaForm!: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private httpClienteService: HttpClientesService = inject(HttpClientesService);
  private alert: AlertService = inject(AlertService);
    private menuComponent: MenuComponent = inject(MenuComponent);
 
  /**
   * Metodo que crea el formulario reactivo del frontend
   * @param fb 
   */

  public ngOnInit(): void {
    this.formBuild();
  }

  /**
   * Crear el formulario reactivo
   */
  private formBuild(): void {
    this.personaForm = this.fb.group({
      idCliente: '',
      cedula: [{value: '', disabled: true}, [Validators.required, Validators.pattern('[a-zA-Z0-9]*'), Validators.maxLength(15)]],
      nombre: ['', [Validators.required, soloTexto()]],
      direccion: ['', [Validators.required,]],
      correo: ['', [Validators.required, validarCorreo()]],
      fechaCreacion: ['', [Validators.required]],
  
    });

  }

  /**
   * Metodo que se ejecuta cuando hay cambios en el componente
   * @param changes 
   */
  public ngOnChanges(changes: SimpleChanges): void {
    if (changes['personaEditar'] && this.personaEditar && this.personaForm) {
      this.personaForm.patchValue(this.personaEditar);
    }
  }
  
  /**
   * Este metodo se encarga de guardar la edición de un cliente
   * @returns void
   */
  protected guardar(): void {

    if (!this.personaForm.valid) {
      
      Object.values(this.personaForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    } 

    
    const { cedula, nombre, direccion, correo} = this.personaForm.value;
    let cliente = ActualizarClienteDTO.crearActualizarClienteDTO(cedula, nombre, direccion, correo);
    
    this.httpClienteService.actualizar(cliente, this.personaEditar.id).subscribe({
      next: ()=>{
        this.alert.simpleSuccessAlert('Cliente editado correctamente');
        this.modoOculto.emit();
      },
      error: (error) => {
        this.alert.simpleErrorAlert(error.error.mensaje);
      }
    });
    this.menuComponent.listarClientes();
  }

}
