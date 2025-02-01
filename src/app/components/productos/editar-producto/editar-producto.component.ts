import { Component, EventEmitter, Inject, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { MenuComponent } from '../../menu/menu.component';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

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

  constructor(
    public dialogRef: MatDialogRef<EditarProductoComponent>, 
    @Inject(MAT_DIALOG_DATA) public codigo: string 
  ) {
  }


  ngOnInit(): void {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      impuesto: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      formasVentas: this.fb.array([]) // Añade un FormArray para formasVentas
    });
    this.productoSeleccionado = {
      codigo: 'ABC123',
      nombre: 'Producto de prueba',
      impuesto: 'IVA',
      fechaCreacion: '1 de enero de 2025',
      formaVentas: []  // o lo que corresponda
    };
    console.log(this.codigo);
    this.abrirModal(this.codigo);
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
    this.productoService.obtenerProductoCompleto(codigo).subscribe((producto) => {
      // Formatear la fecha si es necesario
      const productoFormateado = {
        ...producto,
        fechaCreacion: new Date(producto.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      this.productoSeleccionado = productoFormateado;
  
      // Actualiza los controles del formulario
      this.productoForm.patchValue({
        codigo: productoFormateado.codigo,
        nombre: productoFormateado.nombre,
        impuesto: productoFormateado.impuesto,
        fechaCreacion: productoFormateado.fechaCreacion,
        // Si formasVentas es un FormArray, actualízalo según corresponda
      });
    });
  }
  


  cerrarModal(): void {
    this.dialogRef.close();
  }

}
