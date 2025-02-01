import { Component, EventEmitter, Inject, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
  productoSeleccionado: ProductoCompletoDTO | null = null;
  @Output() modoOculto = new EventEmitter();
  private fb: FormBuilder = inject(FormBuilder);
  private menuComponent: MenuComponent = inject(MenuComponent);
  private productoService: ProductoService = inject(ProductoService);
  modalAbierto = false;
  @Input() idProducto: string = '';
  @Output() cerrar = new EventEmitter<void>();
  protected producto: ProductoCompletoDTO | null = null;
  
  productoForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditarProductoComponent>, 
    @Inject(MAT_DIALOG_DATA) public codigo: string 
  ) {}

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      impuesto: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      formasVentas: this.fb.array([])  // FormArray inicializado vacío
    });

    console.log(this.codigo);
    this.abrirModal(this.codigo);
  }

  /**
   * Cargar datos en el formulario, incluyendo las formas de venta.
   */
  abrirModal(codigo: string): void {
    this.modalAbierto = true;
    this.menuComponent.cerrarMenu();
    this.productoService.obtenerProductoCompleto(codigo).subscribe((producto) => {
      const productoFormateado = {
        ...producto,
        fechaCreacion: new Date(producto.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      this.productoSeleccionado = productoFormateado;
      console.log(productoFormateado);

      // Actualiza los valores del formulario
      this.productoForm.patchValue({
        codigo: productoFormateado.codigo,
        nombre: productoFormateado.nombre,
        impuesto: productoFormateado.impuesto,
        fechaCreacion: productoFormateado.fechaCreacion,
      });

      // Cargar formas de venta en el FormArray
      this.setFormasVentas(productoFormateado.formaVentas);
    });
  }

  /**
   * Inicializa el FormArray de formasVentas con los datos obtenidos.
   */
  private setFormasVentas(formasVentas: any[]): void {
    const formasArray = this.productoForm.get('formasVentas') as FormArray;
    formasArray.clear(); // Limpia antes de agregar nuevos valores

    formasVentas.forEach((forma) => {
      formasArray.push(this.fb.group({
        nombre: [forma.nombre, Validators.required],
        precioCompra: [forma.precioCompra, Validators.required],
        precioVenta: [forma.precioVenta, Validators.required],
        cantidad: [forma.cantidad, Validators.required]
      }));
    });
  }

  get formasVentas(): FormArray {
    return this.productoForm.get('formasVentas') as FormArray;
  }

  cerrarModal(): void {
    this.dialogRef.close();
  }
}
