import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { validarDecimalConDosDecimales } from '../../../validators/validatorFn';
import { AlertService } from 'src/app/utils/alert.service';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { MenuComponent } from '../../menu/menu.component';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent {



  @Input() productosEditar: any = {};
  @Input() productoSeleccionado: any; // Recibe el producto a editar
  @Output() modoOculto = new EventEmitter();
  private fb: FormBuilder = inject(FormBuilder);
  private menuComponent: MenuComponent = inject(MenuComponent);
  private productoService: ProductoService = inject(ProductoService);
  modalAbierto = false;
  @Input() idProducto: string = '';
  @Output() cerrar = new EventEmitter<void>();
  protected producto : ProductoCompletoDTO | null = null;

  productoForm!: FormGroup;


  ngOnInit(): void {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      impuesto: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      formasVentas: this.fb.array([]) // Añade un FormArray para formasVentas
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['idProducto'] && this.idProducto) {
      this.productoService.obtenerProductoCompleto(this.idProducto).subscribe((producto) => {
        this.producto = producto;
        this.modalAbierto = true; // Abre el modal al cargar el producto
        this.inicializarFormulario(); // Inicializa el formulario con los datos
      });
    }
  }

  private inicializarFormulario(): void {
    if (this.producto) {
      this.productoForm.patchValue({
        codigo: this.producto.codigo,
        nombre: this.producto.nombre,
        impuesto: this.producto.impuesto,
        fechaCreacion: this.producto.fechaCreacion
      });
      // Inicializar formas de venta si es necesario
    }
  }

  /**
   * Este método se encarga de guardar el producto en la base de datos
   * @returns 
   */

  protected guardar(): void {
    /**
    const { codigo, nombre, precio, cantidad} = this.personaForm.value;
    let productoActualizar = ActualizarProductoDTO.crearProducto(codigo, nombre, precio, cantidad);
    if (!this.personaForm.valid) {
      Object.values(this.personaForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    } 
    this.productoService.actualizar(productoActualizar);
     */
  }

  abrirModal(codigo: string): void {
    this.modalAbierto = true;
    this.menuComponent.cerrarMenu();
    /*this.productoService.obtenerProductoCompleto(codigo).subscribe((producto) => {
      this.productoSeleccionado = producto;
      this.productoSeleccionado = {
        ...producto,
        fechaCreacion: new Date(producto.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
    });*/
  }


  cerrarModal(): void {
  }

}
