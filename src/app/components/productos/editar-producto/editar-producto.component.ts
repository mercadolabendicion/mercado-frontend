import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validarDecimalConDosDecimales } from '../../../validators/validatorFn';
import { ActualizarProductoDTO } from '../../../dto/producto/ActualizarProductoDTO';
import { AlertService } from 'src/app/utils/alert.service';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { MenuComponent } from '../../menu/menu.component';
@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent {

  
  
  @Input() productosEditar: any = {};
  @Input() productoSeleccionado: any; // Recibe el producto a editar
  @Input() modalAbiertoEditar: boolean = false;
  @Output() modoOculto = new EventEmitter();
  private fb: FormBuilder = inject(FormBuilder);
    private menuComponent: MenuComponent = inject(MenuComponent);
  private productoService: ProductoService = inject(ProductoService);
  private alert: AlertService = inject(AlertService);
  modalAbierto = false;
  protected personaForm!: FormGroup;

  productoForm!: FormGroup;


  ngOnInit(): void {
    this.personaForm = this.fb.group({
      idProducto: '',
      codigo: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]*')]],
      nombre: ['', [Validators.required]],
      precio: ['', [Validators.required, validarDecimalConDosDecimales()]],
      cantidad: ['', [Validators.required, validarDecimalConDosDecimales()]],
      fechaCreacion: ['', [Validators.required]],
    });
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productosEditar'] && this.productosEditar) {
      this.personaForm.patchValue(this.productosEditar);
    }
    console.log(this.productosEditar);
  }
  
  /**
   * Este método se encarga de guardar el producto en la base de datos
   * @returns 
   */
  protected guardar(): void {
    const { codigo, nombre, precio, cantidad} = this.personaForm.value;
    let productoActualizar = ActualizarProductoDTO.crearProducto(codigo, nombre, precio, cantidad);
    if (!this.personaForm.valid) {
      Object.values(this.personaForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    } 
    this.productoService.actualizar(productoActualizar);
  }

  abrirModal(codigo: string): void {
    this.menuComponent.cerrarMenu();
    this.productoService.obtenerProductoCompleto(codigo).subscribe((producto) => {
      this.productoSeleccionado = producto;
      this.productoSeleccionado = {
        ...producto,
        fechaCreacion: new Date(producto.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });
    this.modalAbierto = true;
  }


  cerrarModal(): void {
    this.modalAbierto = false;
  }

}
