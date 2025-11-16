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
import { GuardarFormaVenta } from 'src/app/dto/formasVenta/GuardarFormaVenta';

@Component({
  selector: 'app-editar-producto',
  templateUrl: './editar-producto.component.html',
  styleUrls: ['./editar-producto.component.css']
})
export class EditarProductoComponent {

  productoSeleccionado: ProductoCompletoDTO | null = null;
  mostrarInputs = false;
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
      fechaVencimiento: [''],
      lote: [''],
      fechaCreacion: ['', Validators.required],
      nombreNuevaForma: [''],
      precioCompraNuevaForma: [''],
      precioVentaNuevaForma: [''],
      cantidadNuevaForma: [''],
      formasVentas: this.fb.array([])  // FormArray inicializado vacío
    });

    this.abrirModal(this.codigo);
  }

  /**
   * Cargar datos en el formulario, incluyendo las formas de venta.
   */
  abrirModal(codigo: string): void {
    this.modalAbierto = true;
    this.productoService.obtenerProductoCompleto(codigo).subscribe((producto) => {
      const productoFormateado = {
        ...producto,
        fechaCreacion: new Date(producto.fechaCreacion).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        fechaVencimiento: producto.fechaVencimiento
          ? new Date(producto.fechaVencimiento).toISOString().split('T')[0] // Formato YYYY-MM-DD
          : ''
      };
      
      this.productoSeleccionado = productoFormateado;

      // Actualiza los valores del formulario
      this.productoForm.patchValue({
        codigo: productoFormateado.codigo,
        nombre: productoFormateado.nombre,
        impuesto: productoFormateado.impuesto,
        fechaVencimiento: productoFormateado.fechaVencimiento,  
        lote: productoFormateado.lote,
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
        cantidad: [forma.cantidad, Validators.required],
        minimoDisponible: [forma.minimoStock ?? 0]
      }));
    });
  }

  /**
   * Este getter retorna el FormArray asociado al campo 'formasVentas'
   * dentro del formulario principal del producto. Permite acceder y manipular
   * dinámicamente las diferentes formas de venta que se pueden registrar para un producto.
   * 
   * @returns FormArray que contiene las formas de venta del producto
   */
  get formasVentas(): FormArray {
    return this.productoForm.get('formasVentas') as FormArray;
  }

  /**
   * Este método cierra el modal activo utilizando `dialogRef.close()` 
   * y asegura que el menú lateral esté abierto al salir del modo modal.
   * Es útil para restaurar la interfaz principal tras cerrar un diálogo.
   */
  cerrarModal(): void {
    this.dialogRef.close();
  }

  /**
   * Este método guarda los cambios realizados en el producto. 
   * Llama a métodos para actualizar el nombre del impuesto, las formas de venta 
   * y cargar una nueva forma de venta. Si las actualizaciones del impuesto y las formas 
   * de venta son exitosas, realiza las solicitudes para actualizar el producto y sus formas de venta.
   * 
   * Es útil para persistir los cambios en los datos del producto y sus formas de venta, 
   * asegurando que se actualicen correctamente en el backend.
   */
  guardarCambios(): void {
    let response1 = this.actualizarNombreImpuesto();
    let response2 = this.actualizarFormasVenta();
    let response3 = this.cargarNuevaFormaVenta();
    if(response1 && response2){
      this.requestActualizarProducto();
      this.requestActualizarFormasVenta();
    }
  }

  /**
   * Este método se encarga de cargar una nueva forma de venta para el producto actual.
   * Extrae los datos del formulario del producto, valida que los campos necesarios no estén vacíos
   * y que los valores numéricos sean válidos. Si los datos son correctos, crea una nueva forma de venta
   * y la guarda utilizando el servicio correspondiente.
   * 
   * @returns `true` si la forma de venta fue cargada exitosamente, `false` si los datos son inválidos
   */
  cargarNuevaFormaVenta(): boolean {
    const productoData = this.productoForm.value;
    const formaVenta = {
      nombre: productoData.nombreNuevaForma,
      precioCompra: productoData.precioCompraNuevaForma,
      precioVenta: productoData.precioVentaNuevaForma,
      cantidad: productoData.cantidadNuevaForma
    };
    if (!formaVenta.nombre || formaVenta.nombre.trim() === '') {
      return false;
    }
    if (formaVenta.precioCompra == null) {
      return false;
    }
    if (formaVenta.precioVenta == null) {
      return false;
    }
    if (formaVenta.cantidad == null) {
      return false;
    }
    let guardarFormaVenta = GuardarFormaVenta.crearFormaVenta(productoData.codigo, formaVenta.nombre, formaVenta.precioCompra, formaVenta.precioVenta, formaVenta.cantidad);
    this.productoService.guardarFormaVenta(guardarFormaVenta);
    return true;
  }

  /**
   * Este método actualiza las formas de venta del producto actual. 
   * Realiza las siguientes acciones:
   * 1. Obtiene los datos del formulario y el FormArray con las formas de venta.
   * 2. Itera sobre cada forma de venta en el FormArray y valida los campos requeridos (nombre, precio, cantidad).
   * 3. Si los datos son válidos, crea un DTO de actualización para cada forma de venta.
   * 4. Realiza una validación adicional para asegurar que no existan nombres duplicados entre las formas de venta.
   * 5. Si todo es válido, guarda la lista de formas de venta actualizadas en una variable.
   * 
   * @returns `true` si las formas de venta fueron actualizadas correctamente, `false` si hubo algún error de validación.
   */
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

  /**
   * Este método actualiza el nombre y el impuesto de un producto. 
   * Realiza las siguientes acciones:
   * 1. Obtiene los datos del formulario del producto.
   * 2. Crea un objeto `ActualizarProductoDTO` con los datos obtenidos.
   * 3. Realiza una validación de los datos para asegurarse de que:
   *    - El producto seleccionado existe.
   *    - El código del producto no ha sido modificado.
   *    - El nombre y el impuesto no estén vacíos.
   * 4. Si todas las validaciones son exitosas, guarda el producto actualizado en una variable.
   * 
   * @returns `true` si los datos del producto son válidos y han sido actualizados correctamente, `false` si hay algún error de validación.
   */
  actualizarNombreImpuesto(): boolean {
      const productoData = this.productoForm.value;
      const productoActualizado: ActualizarProductoDTO = ActualizarProductoDTO.actualizarProducto(
        productoData.codigo,
        productoData.nombre,
        productoData.impuesto,
        productoData.fechaVencimiento,
        productoData.lote,
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

  /**
   * Este método realiza una solicitud para actualizar el producto en el sistema.
   * Se encarga de enviar los datos del producto actualizado al servicio correspondiente 
   * para ser guardados en el backend. Al recibir una respuesta exitosa, realiza las siguientes acciones:
   * 1. Cierra el modal de edición de producto.
   * 2. Actualiza la lista de productos en el menú.
   * Si ocurre un error en la solicitud, muestra una alerta con el mensaje de error.
   * 
   * @returns `void`. No devuelve nada, pero realiza una acción asíncrona para actualizar los datos.
   */
  requestActualizarProducto(): void {
    this.productoService.actualizar(this.productoActualizado).subscribe({
      next: () => {
        this.cerrarModal();
      },
      error: (err) => {
        this.alert.simpleErrorAlert(err);
      }
    });
  }

  /**
   * Este método realiza una solicitud para actualizar las formas de venta asociadas a un producto.
   * Itera sobre la lista de formas de venta actualizadas (`formasVentasActualizadas`), enviando cada una al servicio correspondiente 
   * para ser actualizada en el backend. Si ocurre un error durante la actualización de alguna forma de venta, 
   * se muestra una alerta con el mensaje de error. 
   * 
   * Al finalizar las actualizaciones, realiza las siguientes acciones:
   * 1. Actualiza la lista de productos en el menú.
   * 2. Cierra el modal de edición de producto.
   * 
   * @returns `void`. No devuelve nada, pero realiza varias acciones asíncronas para actualizar las formas de venta.
   */
  requestActualizarFormasVenta(): void {
    this.formasVentasActualizadas.forEach((formaVenta) => {
      this.productoService.actualizarFormaVenta(formaVenta).subscribe({
        next: () => {},
        error: (err) => {
          this.alert.simpleErrorAlert(err);
        }
      });
    });  
    this.cerrarModal();
  }

  /**
   * Este método permite eliminar una forma de venta asociada a un producto.
   * Primero, solicita una confirmación del usuario mediante una alerta de confirmación. 
   * Si el usuario confirma la eliminación, realiza las siguientes acciones:
   * 1. Elimina la forma de venta de la lista de formas de venta en el formulario (`FormArray`).
   * 2. Llama al servicio correspondiente (`productoService.eliminarFormaVenta`) para eliminar la forma de venta del backend.
   * 3. Muestra una alerta de éxito indicando que la forma de venta ha sido eliminada correctamente.
   * 
   * @param fila El índice de la forma de venta en el formulario que se desea eliminar.
   * @returns `void`. No devuelve nada, pero realiza varias acciones al eliminar la forma de venta seleccionada.
   */
  eliminarFormaVenta(fila: number) {
    let nombreForma = this.formasVentas.controls[fila].get('nombre')!.value;
    let codigo = this.productoSeleccionado!.codigo;

  this.alert.confirmAlert('Eliminar forma de venta','¿Está seguro que desea eliminar la forma de venta ' 
    + nombreForma + ' para el producto '+ this.productoSeleccionado?.nombre+'? \t\n'
    + 'Esta acción no se puede deshacer.').then((response) => {
      if(response){
        this.formasVentas.removeAt(fila);
        this.productoService.eliminarFormaVenta(codigo, nombreForma);
        this.alert.simpleSuccessAlert('Forma de venta eliminada');
      }
    });
  }

  /**
   * Este método permite mostrar los inputs necesarios para agregar una nueva fila de datos.
   * Cambia el valor de la variable `mostrarInputs` a `true`, lo que probablemente activa la visualización 
   * de campos de entrada o formularios en la interfaz de usuario para que el usuario pueda ingresar información.
   * 
   * @returns `void`. No devuelve nada, solo cambia el estado de la variable `mostrarInputs`.
   */
  agregarFila(): void {
    this.mostrarInputs = true;
  }
}
