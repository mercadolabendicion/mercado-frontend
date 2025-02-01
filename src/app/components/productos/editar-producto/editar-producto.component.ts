import { Component, EventEmitter, Inject, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { MenuComponent } from '../../menu/menu.component';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActualizarProductoDTO } from 'src/app/dto/producto/ActualizarProductoDTO';
import { AlertService } from 'src/app/utils/alert.service';
import { ActualizarFormaVentaCompletoDTO } from 'src/app/dto/producto/ActualizarFormaVentaCompletoDTO';
import { ActualizarFormaVentaDTO } from 'src/app/dto/producto/ActualizarFormaVentaDTO';

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
  private alert: AlertService = inject(AlertService);
  private productoActualizado!: ActualizarProductoDTO;
  private formasVentasActualizadas: ActualizarFormaVentaCompletoDTO[] = [];

  productoForm!: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<EditarProductoComponent>,
    @Inject(MAT_DIALOG_DATA) public codigo: string
  ) { }

  ngOnInit(): void {
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required],
      nombre: ['', Validators.required],
      impuesto: ['', Validators.required],
      fechaCreacion: ['', Validators.required],
      formasVentas: this.fb.array([])  // FormArray inicializado vacío
    });

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
        nombreAnterior: [forma.nombre, Validators.required],
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

  guardarCambios(): void {

    let response1 = this.actualizarNombreImpuesto();
    let response2 = this.actualizarFormasVenta();
    if(response1 && response2){
      this.requestActualizarProducto();
      this.requestActualizarFormasVenta();
    }
    
  }

  actualizarFormasVenta(): boolean {
    // Obtenemos el valor completo del formulario.
    const productoData = this.productoForm.value;
    // Obtenemos el FormArray que contiene las formas de venta.
    const formasVentasFormArray = this.productoForm.get('formasVentas') as FormArray;
    // Lista donde almacenaremos los DTO creados.
    const listaFormasVentaDTO: ActualizarFormaVentaCompletoDTO[] = [];
  
    // Iteramos cada uno de los controles del FormArray.
    formasVentasFormArray.controls.forEach((control, index) => {
      const forma = control.value;
      const fila = `\n Revise la fila ${index + 1}`;
  
      // Validaciones individuales (ejemplo)
      if (!forma.nombre || forma.nombre.trim() === '') {
        this.alert.simpleErrorAlert('El nombre de la forma de venta no puede ser vacío.' + fila);
        return;
      }
      if (forma.precioCompra == null) {
        this.alert.simpleErrorAlert('El precio de compra no puede ser vacío.' + fila);
        return;
      }
      if (forma.precioVenta == null) {
        this.alert.simpleErrorAlert('El precio de venta no puede ser vacío.' + fila);
        return;
      }
      if (forma.cantidad == null) {
        this.alert.simpleErrorAlert('La cantidad no puede ser vacía.' + fila);
        return;
      }
  
      // Aquí puedes crear el objeto ActualizarFormaVentaDTO que forma parte de tu DTO completo.
      // Suponiendo que ActualizarFormaVentaDTO tiene propiedades: precioCompra, precioVenta y cantidad.
      const datosFormaVentaDTO = new ActualizarFormaVentaDTO();
      datosFormaVentaDTO.precioCompra = forma.precioCompra;
      datosFormaVentaDTO.precioVenta = forma.precioVenta;
      datosFormaVentaDTO.cantidad = forma.cantidad;
      datosFormaVentaDTO.nuevoNombre = forma.nombre;
  
      // Crea el DTO completo usando el método estático de fábrica.
      // En este ejemplo, se utiliza el código del producto para el parámetro "codigo".
      const formaVentaCompletoDTO = ActualizarFormaVentaCompletoDTO.ActualizarFormaVentaCompleto(
        productoData.codigo,  // O el valor que corresponda para el código
        forma.nombreAnterior,         // El nombre de la forma de venta
        datosFormaVentaDTO,    // Los datos de la forma de venta

      );
  
      // Agrega el DTO a la lista.
      listaFormasVentaDTO.push(formaVentaCompletoDTO);
    });
  
    // Ejemplo de validación de nombres duplicados (simplificado):
    for (let i = 0; i < listaFormasVentaDTO.length; i++) {
      for (let j = i + 1; j < listaFormasVentaDTO.length; j++) {
        // Compara los nombres en minúsculas y sin espacios.
        const nombreI = listaFormasVentaDTO[i].formaVentaDTO.nuevoNombre.toLowerCase().replace(/\s/g, '');
        const nombreJ = listaFormasVentaDTO[j].formaVentaDTO.nuevoNombre.toLowerCase().replace(/\s/g, '');
        if (nombreI === nombreJ) {
          this.alert.simpleErrorAlert('No puede haber dos formas de venta con el mismo nombre.');
          return false;
        }
      }
    }
  
    this.formasVentasActualizadas = listaFormasVentaDTO;
    return true;
  }  

  actualizarNombreImpuesto(): boolean {

      const productoData = this.productoForm.value;

      const productoActualizado: ActualizarProductoDTO = ActualizarProductoDTO.actualizarProducto(
        productoData.codigo,
        productoData.nombre,
        productoData.impuesto
      );
      
      if(productoActualizado == null || undefined){
        this.alert.simpleErrorAlert('No se encontró el producto seleccionado');
        return false;
      }

      if(productoActualizado.codigo != productoActualizado.codigo){
        this.alert.simpleErrorAlert('El código del producto no puede ser modificado');
        return false;
      }

      if(productoActualizado.nombre == null || productoActualizado.nombre == ''){
        this.alert.simpleErrorAlert('El nombre del producto no puede ser vacío');
        return false;
      }

      if(productoActualizado.impuesto == null || productoActualizado.impuesto == ''){
        this.alert.simpleErrorAlert('El impuesto del producto no puede ser vacío');
        return false;
      }

      this.productoActualizado = productoActualizado;

      return true;

  }

  requestActualizarProducto(): void {
    this.productoService.actualizar(this.productoActualizado).subscribe({
      next: () => {
        this.cerrarModal();
        this.menuComponent.listarProductos();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
      }
    });
  }

  requestActualizarFormasVenta(): void {
    this.formasVentasActualizadas.forEach((formaVenta) => {
      this.productoService.actualizarFormaVenta(formaVenta).subscribe({
        next: () => {},
        error: (err) => {
          this.alert.simpleErrorAlert(err);
        }
      });
    });  
    this.menuComponent.listarProductos();
    this.cerrarModal();
  }
}
