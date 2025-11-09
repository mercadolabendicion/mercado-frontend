import {
  Component,
  DoCheck,
  ViewChild,
  ElementRef,
  HostListener,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

// DTOs y modelos
import { CrearVentaDTO } from 'src/app/dto/venta/CrearVentaDTO';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { ClienteDTO } from 'src/app/dto/cliente/ClienteDTO';
import { CarritoProductoDTO } from 'src/app/dto/producto/CarritoProductoDTO';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { FormaVenta } from 'src/app/dto/formasVenta/FormaVenta';

// Servicios de dominio
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { VentaService } from 'src/app/services/domainServices/venta.service';
import { ClienteService } from 'src/app/services/domainServices/cliente.service';
import { ScaleService } from 'src/app/services/domainServices/scale.service';
import { MenuComponent } from '../../menu/menu.component';
import { ScannerService } from 'src/app/services/domainServices/scannerService';

@Component({
  selector: 'app-venta',
  templateUrl: './venta.component.html',
  styleUrls: ['./venta.component.css'],
})
export class VentaComponent implements DoCheck {
  @ViewChild('inputProducto') inputProductoRef!: ElementRef<HTMLInputElement>;
  @ViewChild('agregarUsuarioModal') modalElement!: ElementRef;
  @HostListener('document:click', ['$event'])

  /**
   * Maneja los clics del documento para mantener el foco en el input de producto,
   * salvo cuando se hace clic en elementos interactivos, popups o modales.
   */
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (
      this.inputProductoRef &&
      this.inputProductoRef.nativeElement.contains(target)
    )
      return;
    const ignoreTags = ['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON', 'LABEL'];
    if (
      ignoreTags.includes(target.tagName) ||
      target.closest('.popup') ||
      target.closest('.modal')
    ) {
      return;
    }
    if (document.activeElement === this.inputProductoRef.nativeElement) return;
    this.focusInputProducto();
  }

  // Inyección de dependencias
  private formBuilder: FormBuilder = inject(FormBuilder);
  private clienteService: ClienteService = inject(ClienteService);
  private productoService: ProductoService = inject(ProductoService);
  private ventaService: VentaService = inject(VentaService);
  private menuComponent: MenuComponent = inject(MenuComponent);

  // Estados UI / Formularios
  protected formulario!: FormGroup;
  protected productosForm!: FormGroup;
  protected modoOculto: boolean = true;
  protected aplicarDescuento: boolean = false;
  protected descuentoAplicado: boolean = false;
  protected valorDescuento: string | null = null;
  valorFormateado: string = ''; // Para almacenar el valor con formato de dinero

  // Clientes / Productos
  protected clientes: ClienteDTO[];
  protected productos: ProductoDTO[];
  protected clientesFiltrados: ClienteDTO[] = [];
  protected productosFiltrados: ProductoDTO[] = [];
  protected clienteSeleccionado!: ClienteDTO | null;
  protected productoSeleccionado!: ProductoDTO | null;
  productosCompletos: ProductoCompletoDTO[] = []; // Lista auxiliar para productos completos (con formas de venta)

  // Carrito
  protected formaVenta!: string[];
  protected cantidadDisponible!: number;
  protected productoDisponible!: string;
  protected productoSeleccionadoPrecio = 0;
  editandoFormaVentaIndex: number | null = null; // Fila que se está editando
  protected listProductos: CarritoProductoDTO[];
  private formasVentaProductoSeleccionado!: FormaVenta[];

  // Totales
  protected subtotal: number = 0;
  protected porcentajeIva: number = 19;
  protected igv: number = 0;
  protected total = 0;
  private totalReal!: number;
  private descuento!: number;
  protected hayStock = true;
  protected stockProducto: number;

  // Balanza
  private scaleSubscription?: Subscription;
  protected balanzaConectada: boolean = false;
  protected pesoActual: number = 0;
  protected pesoEstable: boolean = false;
  protected campoEnfocado: string | null = null;
  protected indiceProductoEnfocado: number | null = null;

  constructor(
    private scaleService: ScaleService,
    private scannerService: ScannerService
  ) {
    this.clientes = [];
    this.productos = [];
    this.listProductos = [];
    this.stockProducto = 0;
    this.descuento = 0;
  }

  ngDoCheck() {
    this.validarFormularios();
  }

  ngOnInit() {
    this.generarIdFactura();
    this.buildForms();
    this.listarProductos();
    this.listarClientes();
    this.valorDescuento = null;
    this.setClientePorDefecto('222222222222');
    this.suscribirseABalanza(); // Suscribirse a los datos de la balanza
  }

  ngOnDestroy() {
    // Limpiar suscripciones y desconectar balanza
    if (this.scaleSubscription) {
      this.scaleSubscription.unsubscribe();
    }
    this.scaleService.disconnect();
  }

  /**
   * Este metodo se encarga de construir los formularios de la vista
   */
  private buildForms() {
    this.formulario = this.formBuilder.group({
      numFactura: ['', [Validators.required]],
      cliente: ['', [Validators.required]],
      nombre: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
    });

    this.productosForm = this.formBuilder.group({
      codigoProducto: ['', [Validators.required]],
      nombreProducto: ['', [Validators.required]],
      precio: [''],
      formaVenta: [''],
      cantidadProducto: [1],
    });
  }

  /**
   * Este metodo se encarga de validar si los campos del formulario están completos
   * @returns
   */
  private validarFormulario(): boolean {
    if (!this.formulario.valid) {
      this.formulario.markAllAsTouched();
      return false;
    }
    this.validarFormularios();
    return true;
  }

  /**
   * Este metodo se encarga de validar los campos del formulario
   * y asignar los valores de los campos al formulario
   */
  private validarFormularios(): void {
    // Validar cliente
    this.actualizarFormulario(
      this.formulario,
      this.clienteSeleccionado,
      {
        ruc: 'rucDni',
        razonSocial: 'nombre',
        correo: 'correo',
      },
      ['ruc', 'razonSocial', 'correo']
    );

    // Validar producto
    this.actualizarFormulario(
      this.productosForm,
      this.productoSeleccionado,
      {
        nombreProducto: 'nombre',
        precioProducto: 'precio',
      },
      ['nombreProducto', 'precioProducto']
    );
  }

  /**
   * Este metodo se encarga de enviar el formulario de la vista
   */
  onSubmit() {
    if (!this.validarFormulario()) return;
    const venta = this.crearVentaDTO();
    if (!this.validarProductosVenta(venta)) return;
    this.procesarVenta(venta);
    this.focusInputProducto();
  }

  // LISTAR PRODUCTOS Y CLIENTES

  /**
   * Este método se encarga de listar todos los productos disponibles desde localStorage,
   * donde los datos son actualizados por el endpoint getTodosProductos.
   */
  protected listarProductos(): void {
    this.menuComponent.listarProductos();
    this.productos = [];
    const productosGuardados = localStorage.getItem('productos');
    if (productosGuardados) {
      try {
        this.productos = JSON.parse(productosGuardados) as ProductoDTO[];
      } catch (err) {
        console.error('Error al parsear productos desde localStorage:', err);
      }
    } else {
      console.warn('No se encontraron productos en localStorage.');
    }
  }

  /**
   * Este método se encarga de listar todos los clientes disponibles desde localStorage,
   * donde los datos son actualizados por el endpoint getTodosClientes.
   */
  listarClientes(): void {
    this.menuComponent.listarClientes();
    this.clientes = [];
    const clientesGuardados = localStorage.getItem('clientes');
    if (clientesGuardados) {
      try {
        this.clientes = JSON.parse(clientesGuardados) as ClienteDTO[];
      } catch (err) {
        console.error('Error al parsear clientes desde localStorage:', err);
      }
    } else {
      console.warn('No se encontraron clientes en localStorage.');
    }
  }

  /**
   * Asigna un cliente por defecto al cargar la pantalla.
   */
  private setClientePorDefecto(cedula: string): void {
    const clientePorDefecto = this.clientes.find((c) => c.cedula === cedula);
    if (clientePorDefecto) {
      this.formulario.patchValue({
        cliente: clientePorDefecto.cedula,
      });
      this.asignarCliente(clientePorDefecto);
    } else {
      console.warn('No se encontró el cliente por defecto con cédula', cedula);
    }
  }

  /**
   * Filtra los productos según el texto ingresado en el campo 'codigoProducto'.
   */
  protected filtrarProductos(): void {
    const idProducto =
      this.productosForm.get('codigoProducto')?.value?.toLowerCase() || '';
    if (idProducto.trim() === '') {
      this.productosFiltrados = [];
      return;
    }
    this.productosFiltrados = this.productos.filter(
      (producto) =>
        producto.codigo.toLowerCase().includes(idProducto) ||
        producto.nombre.toLowerCase().includes(idProducto)
    );
  }

  /**
   * Filtra los clientes según el texto ingresado en el campo 'cedulaCliente'.
   */
  protected filtrarClientes(): void {
    const ccCliente =
      this.formulario.get('cliente')?.value?.toLowerCase() || '';
    if (ccCliente.trim() === '') {
      this.clientesFiltrados = [];
      return;
    }
    this.clientesFiltrados = this.clientes.filter(
      (cliente) =>
        cliente.cedula.toLowerCase().includes(ccCliente) ||
        cliente.nombre.toLowerCase().includes(ccCliente)
    );
  }

  /**
   * Este metodo se encarga de seleccionar un cliente de la lista de clientes de la base de datos
   */
  protected seleccionarCliente(): void {
    let cedula = this.formulario.get('cliente')!.value;
    if (cedula == '') {
      this.formulario.reset();
      this.generarIdFactura();
    }
    this.ventaService.obtenerCliente(cedula).subscribe((response) => {
      this.formulario.patchValue({
        nombre: response?.nombre,
        direccion: response?.direccion,
        correo: response?.correo,
      });
    });
  }

  /**
   * Maneja la selección de un producto desde la lista de sugerencias.
   * @param producto Producto seleccionado.
   */
  protected seleccionarProductoDeLista(producto: ProductoDTO): void {
    this.productosForm.patchValue({
      codigoProducto: producto.codigo,
    });
    this.ocultarSugerencias();
    this.asignarProducto(producto);
  }

  /**
   * Maneja la selección de un cliente desde la lista de sugerencias.
   * @param cliente Cliente seleccionado.
   */
  protected seleccionarClienteDeLista(cliente: ClienteDTO): void {
    this.formulario.patchValue({
      cliente: cliente.cedula,
    });
    this.ocultarSugerencias();
    this.asignarCliente(cliente);
  }

  /**
   * Este metodo se encarga de asignar un producto a la variable productoSeleccionado
   * @param producto El producto a asignar
   * @returns void
   */
  asignarProducto(producto: ProductoDTO): void {
    if (!producto) {
      this.productosForm
        .get('codigoProducto')
        ?.setErrors({ productoNoEncontrado: true });
      this.productoSeleccionado = null;
      return;
    }
    this.productoSeleccionado = producto;
    this.productosForm.patchValue({
      nombreProducto: producto.nombre,
    });
    this.productoService
      .obtenerFormasVentaByCodigo(producto.codigo)
      .subscribe((response) => {
        this.formaVenta = [];
        this.formasVentaProductoSeleccionado = response;
        response.forEach((element) => {
          this.formaVenta.push(element.nombre);
        });
        // Solo aquí, cuando ya tienes las formas de venta, agregas el producto
        this.productosForm.get('formaVenta')?.setValue(0); // Selecciona la primera forma por defecto
        this.cambiarPrecio();
        this.agregarProducto();
      });
  }

  /**
   * Este metodo se encarga de asignar un cliente a la variable clienteSeleccionado
   * @param cliente El producto a asignar
   * @returns void
   */
  asignarCliente(cliente: ClienteDTO): void {
    if (!cliente) {
      this.formulario
        .get('cedulaCliente')
        ?.setErrors({ clienteNoEncontrado: true });
      this.clienteSeleccionado = null;
      return;
    }
    this.clienteSeleccionado = cliente;
    this.formulario.patchValue({
      nombre: cliente.nombre,
      direccion: cliente.direccion,
    });
    this.focusInputProducto();
  }

  // VENTA

  /**
   * Este metodo devuelve un objeto de tipo CrearVentaDTO con los datos del formulario
   * @returns
   */
  private crearVentaDTO(): CrearVentaDTO {
    let venta = new CrearVentaDTO();
    venta.cliente = this.formulario.get('cliente')!.value;
    venta.usuario = Number(localStorage.getItem('id'));
    venta.descuento = this.descuento;
    return venta;
  }

  /**
   * Este metodo se encarga de validar si los productos de la venta están en la base de datos
   * @param venta
   * @returns
   */
  private validarProductosVenta(venta: CrearVentaDTO): boolean {
    return this.ventaService.agregarProductosVenta(venta, this.listProductos);
  }

  /**
   * Este metodo se encarga de agregar un producto a la lista de productos de la factura
   * y calcular el subtotal, igv y total de la factura
   * @returns
   */
  public async agregarProducto(): Promise<void> {
    // console.log(this.formasVentaProductoSeleccionado);
    if (!this.productosForm.valid) {
      Object.values(this.productosForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    // Extrae el índice de forma segura (default a 0 si null/undefined)
    const indice = this.productosForm.get('formaVenta')?.value ?? 0;
    const cantidad = +this.productosForm.get('cantidadProducto')?.value;
    const codigo = this.productosForm.get('codigoProducto')?.value;

    try {
      const productoEliminado =
        await this.productoService.verificarProductoEliminado(codigo);
      const formaVenta =
        this.formasVentaProductoSeleccionado[indice]?.nombre ??
        this.formasVentaProductoSeleccionado[0]?.nombre ??
        '';
      console.log('Forma de venta seleccionada: ' + formaVenta);

      // const cantidadValida =
      //   await this.productoService.verificarProductoCantidad(
      //     cantidad,
      //     codigo,
      //     formaVenta
      //   );

      if (productoEliminado
        //  || !cantidadValida
        ) {
        this.hayStock = false;
        return;
      }

      const precio = this.productosForm.get('precio')?.value;
      const precioEntero = parseInt(precio.replace(/[\$,]/g, ''), 10);
      const nombre = this.productosForm.get('nombreProducto')?.value;
      const productoExistente = this.listProductos.find(
        (prod) => prod.codigo === codigo && prod.formaVenta === formaVenta
      );
      if (productoExistente) {
        productoExistente.cantidad += cantidad;
        console.log(productoExistente);
      } else {
        const producto = CarritoProductoDTO.crearProducto(
          codigo,
          nombre,
          precioEntero,
          cantidad,
          formaVenta
        );
        this.listProductos.push(producto);
      }

      this.resetForms();
      this.subtotal = this.listProductos.reduce(
        (total, producto) => total + producto.precio * producto.cantidad,
        0
      );
      this.calcularValores();
      this.focusInputProducto();
      if (!this.productosCompletos.find((p) => p.codigo === codigo)) {
        this.productoService
          .obtenerProductoCompleto(codigo)
          .subscribe((prodCompleto) => {
            this.productosCompletos.push(prodCompleto);
          });
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Este metodo se encarga de guardar la venta en la base de datos
   * @param venta
   */
  private async procesarVenta(venta: CrearVentaDTO): Promise<void> {
    this.calcularValores();
    try {
      const ventaCreada = await this.ventaService.crearVenta(venta, this.total);

      // Solo se ejecutan estas líneas si la promesa retorna true
      if (ventaCreada) {
        this.finalizarVenta();
        this.menuComponent.listarVentas();
        this.cantidadDisponible = 0;
      } else {
        console.error('La venta no se pudo procesar correctamente.');
      }
    } catch (error) {
      console.error('Error al procesar la venta:', error);
    }
  }

  /**
   * Este metodo limpia los campos del formulario y genera un nuevo id de factura
   */
  private finalizarVenta(): void {
    this.formulario.reset();
    this.generarIdFactura();
    this.resetListProductos();
    this.clienteSeleccionado = null;
  }

  /**
   * Este metodo limpia la lista de productos y los valores de la factura
   */
  private resetListProductos(): void {
    this.listProductos = [];
    this.subtotal = 0;
    this.igv = 0;
    this.total = 0;
  }

  /**
   * Este metodo se encarga de obtener el id de la factura
   */
  protected generarIdFactura(): void {
    this.ventaService.generarIdVenta().subscribe((resp: number) => {
      this.formulario.patchValue({
        numFactura: resp,
      });
    });
  }

  /**
   * Este metodo se encarga de calcular el subtotal, igv y total de la factura
   */
  private calcularValores(): void {
    this.subtotal = this.listProductos.reduce(
      (total: number, producto: CarritoProductoDTO) =>
        total + producto.precio * producto.cantidad,
      0
    );
    this.igv = this.subtotal * (this.porcentajeIva / 100);
    this.total = this.subtotal - this.descuento;
    this.totalReal = this.total;
  }

  /**
   * Este metodo se encarga de eliminar un producto de la lista de productos de la factura
   * @param producto Producto a eliminar
   */
  protected eliminarPorId(producto: CarritoProductoDTO): void {
    const indice = this.listProductos.indexOf(producto);
    if (indice !== -1) {
      this.listProductos.splice(indice, 1);
      this.calcularValores();
    }
    this.focusInputProducto();
  }

  // METODOS AUXILIARES

  /**
   * Actualiza los valores de un formulario reactivo y valida los campos.
   * @param formulario El formulario a actualizar.
   * @param objetoSeleccionado El objeto con los datos seleccionados (puede ser nulo).
   * @param camposMap Un mapeo entre los campos del formulario y las propiedades del objeto.
   * @param camposValidar Una lista de nombres de campos que deben ser validados si no hay objeto seleccionado.
   */
  private actualizarFormulario(
    formulario: FormGroup,
    objetoSeleccionado: any | null,
    camposMap: { [key: string]: string },
    camposValidar: string[]
  ): void {
    if (objetoSeleccionado) {
      // Actualizar los campos con los valores del objeto seleccionado
      const valores = Object.keys(camposMap).reduce((acc, key) => {
        acc[key] = objetoSeleccionado[camposMap[key]] || '';
        return acc;
      }, {} as { [key: string]: any });
      formulario.patchValue(valores);
    } else {
      // Vaciar los campos y añadir validaciones si no hay objeto seleccionado
      const valores = Object.keys(camposMap).reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {} as { [key: string]: any });
      formulario.patchValue(valores);
      camposValidar.forEach((campo) => {
        formulario.get(campo)?.setValidators(Validators.required);
      });
    }
    // Actualizar el estado de validación de los campos
    camposValidar.forEach((campo) => {
      formulario.get(campo)?.updateValueAndValidity();
    });
  }

  /**
   * Método para detectar cuando el input de cantidad de un producto del carrito recibe el foco
   */
  onCantidadFocusCarrito(index: number): void {
    this.indiceProductoEnfocado = index;
    console.log(
      `Campo cantidad del producto ${index} enfocado - esperando peso de balanza`
    );
  }

  /**
   * Método para detectar cuando el input de cantidad de un producto del carrito pierde el foco
   */
  onCantidadBlurCarrito(): void {
    this.indiceProductoEnfocado = null;
    console.log('Campo cantidad desenfocado');
  }

  /**
   * Método para detectar cuando el input de cantidad recibe el foco
   */
  onCantidadFocus(): void {
    this.campoEnfocado = 'cantidad';
    console.log('Campo cantidad enfocado - esperando peso de balanza');
  }

  /**
   * Método para detectar cuando el input de cantidad pierde el foco
   */
  onCantidadBlur(): void {
    this.campoEnfocado = null;
    console.log('Campo cantidad desenfocado');
  }

  /**
   * Este metodo cambia la cantidad de un producto en el carrito
   */
  cambiarCantidad(index: number, nuevaCantidad: number) {
    const producto = this.listProductos[index];
    const maxDisponible = this.getCantidadDisponible(producto);

    if (nuevaCantidad > maxDisponible) nuevaCantidad = maxDisponible;
    producto.cantidad = nuevaCantidad;
    this.calcularValores();
    this.focusInputProducto();
  }

  /**
   * Este metodo se encarga de resetear los campos del formulario de productos
   * y el producto seleccionado
   */
  private resetForms(): void {
    this.productosForm.reset();
    this.productoSeleccionado = null;
    this.productosForm.get('cantidadProducto')?.setValue(1);
  }

  /**
   * Método para formatear un valor con comas
   */
  formatearValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, ''); // Elimina caracteres no numéricos
    const valorNumerico = parseInt(valorSinFormato, 10);
    this.descuento = 0;

    if (!isNaN(valorNumerico)) {
      this.valorFormateado = valorNumerico.toLocaleString('en-US'); // Formato con comas
      this.valorDescuento = this.valorFormateado;
      input.value = this.valorFormateado;
      if (this.valorDescuento != '') {
        this.descuento = valorNumerico;
      }
    }
  }

  /**
   * Este metodo se encarga de cambiar el modo de visualización de la vista
   */
  protected cambiarModoOculto(): void {
    this.modoOculto = !this.modoOculto;
  }

  /**
   * Oculta las sugerencias al perder el foco del campo.
   */
  protected ocultarSugerencias(): void {
    this.productosFiltrados = [];
    this.clientesFiltrados = [];
  }

  /**
   *  Cambiar forma de venta y actualizar precio/cantidad
   */
  cambiarFormaVenta(index: number, nuevaFormaVenta: string) {
    const producto = this.listProductos[index];
    const formas = this.getFormasVentaProducto(producto);
    const forma = formas.find((f) => f.nombre === nuevaFormaVenta);
    if (forma) {
      producto.formaVenta = forma.nombre;
      producto.precio = forma.precioVenta;
      // Ajustar cantidad si supera el stock de la nueva forma de venta
      if (producto.cantidad > forma.cantidad) {
        producto.cantidad = forma.cantidad;
      }
      this.calcularValores();
    }
    this.desactivarEdicionFormaVenta();
    this.focusInputProducto();
  }

  activarEdicionFormaVenta(index: number) {
    this.editandoFormaVentaIndex = index;
  }

  desactivarEdicionFormaVenta() {
    this.editandoFormaVentaIndex = null;
  }

  //DESCUENTO

  /**
   * Método que se aplica un descuento al total de la venta
   */
  public reducirTotal() {
    this.total = this.totalReal;
    if (this.total - this.descuento < 0) {
      this.ventaService.mostrarErrorTotalNegativo();
    } else {
      this.aplicarDescuento = false;
      this.total = this.total - this.descuento;
      this.descuentoAplicado = true;
    }
  }

  /**
   * Método que se cancela un descuento al total de la venta
   */
  public cancelarDescuento() {
    this.total = this.totalReal;
    this.descuentoAplicado = false;
    this.focusInputProducto();
  }

  //UTILIDADES

  /**
   * Este metodo se encarga de cambiar el precio del producto seleccionado
   */
  cambiarPrecio() {
    if (this.productoSeleccionado) {
      let precio =
        this.formasVentaProductoSeleccionado[
          this.productosForm.get('formaVenta')!.value
        ].precioVenta;
      this.productosForm
        .get('precio')
        ?.setValue('$' + precio.toLocaleString('en-US'));
      this.cantidadDisponible =
        this.formasVentaProductoSeleccionado[
          this.productosForm.get('formaVenta')!.value
        ].cantidad;
      this.productoDisponible = this.formasVentaProductoSeleccionado[
          this.productosForm.get('formaVenta')!.value
        ].nombre + " de " + this.productoSeleccionado.nombre;
    }
  }

  /**
   * Busca un producto por código y actualiza el formulario con sus datos.
   */
  patchearProducto() {
    let codigoProd = this.productosForm.get('codigoProducto')?.value;
    let producto = this.productos.find((prod) => prod.codigo == codigoProd);

    if (producto) {
      this.productoSeleccionado = producto;
      this.seleccionarProductoDeLista(producto);
    } else {
      this.productoSeleccionado = null;
      this.productosForm.patchValue({
        nombreProducto: '',
        precioProducto: '',
      });
      this.formaVenta = [];
    }
  }

  // TrackBy para *ngFor
  trackByCodigo(index: number, item: CarritoProductoDTO) {
    return item.codigo + '-' + item.formaVenta;
  }

  // Obtener ProductoCompletoDTO por código
  getProductoCompleto(codigo: string): ProductoCompletoDTO | undefined {
    return this.productosCompletos.find((p) => p.codigo === codigo);
  }

  // Obtener formas de venta para un producto en la tabla
  getFormasVentaProducto(producto: CarritoProductoDTO): FormaVenta[] {
    return this.getProductoCompleto(producto.codigo)?.formaVentas || [];
  }

  // Obtener cantidad disponible para la forma de venta actual
  getCantidadDisponible(producto: CarritoProductoDTO): number {
    const formas = this.getFormasVentaProducto(producto);
    const forma = formas.find((f) => f.nombre === producto.formaVenta);
    return forma ? forma.cantidad : 99999;
  }

  obtenerValorInputNumber(event: Event): number {
    const input = event.target as HTMLInputElement;
    return input && input.value ? Number(input.value) : 1;
  }

  private focusInputProducto() {
    setTimeout(() => {
      this.inputProductoRef?.nativeElement.focus();
      this.inputProductoRef?.nativeElement.select();
    }, 0);
  }

  //BALANZA

  /**
   * Se suscribe a los cambios de peso de la balanza
   */
  private suscribirseABalanza(): void {
    this.scaleSubscription = this.scaleService.weight$.subscribe((data) => {
      this.pesoActual = data.weight;
      this.pesoEstable = data.stable;

      // Si el peso es estable y hay un producto del carrito enfocado
      if (data.stable && this.indiceProductoEnfocado !== null) {
        this.actualizarCantidadCarritoDesdeBalanza(
          this.indiceProductoEnfocado,
          data.weight
        );
        console.log(
          `Peso estable recibido de balanza: ${data.weight} ${data.unit} - Aplicado al producto ${this.indiceProductoEnfocado}`
        );
      }
      // Si el peso es estable y el campo de cantidad del formulario está enfocado
      else if (data.stable && this.campoEnfocado === 'cantidad') {
        this.actualizarCantidadDesdeBalanza(data.weight);
        console.log(
          `Peso estable recibido de balanza: ${data.weight} ${data.unit}`
        );
      }
    });
  }

  /**
   * Actualiza la cantidad de un producto en el carrito desde el peso de la balanza
   */
  private actualizarCantidadCarritoDesdeBalanza(
    index: number,
    peso: number
  ): void {
    // Verificar que el índice sea válido
    if (index < 0 || index >= this.listProductos.length) return;

    const producto = this.listProductos[index];

    // Convertir el peso según la unidad
    let cantidadFinal = peso;

    // Si el peso es muy pequeño, ignorarlo (evitar ruido)
    if (cantidadFinal < 0.01) return;

    // Redondear a 3 decimales (como está configurado en el servicio)
    cantidadFinal = Math.round(cantidadFinal * 1000) / 1000;

    // Verificar que no exceda el stock disponible
    const maxDisponible = this.getCantidadDisponible(producto);
    if (cantidadFinal > maxDisponible) {
      cantidadFinal = maxDisponible;
      console.warn(
        `Peso ${peso} excede el stock disponible (${maxDisponible}). Se ajustó a ${cantidadFinal}`
      );
    }

    // Actualizar la cantidad del producto
    producto.cantidad = cantidadFinal;

    // Recalcular totales
    this.calcularValores();

    console.log(
      `Cantidad del producto "${producto.nombre}" actualizada a ${cantidadFinal} kg desde balanza`
    );
  }

  /**
   * Conecta con la balanza
   */
  async conectarBalanza(): Promise<void> {
    try {
      this.balanzaConectada = await this.scaleService.connect();
      if (this.balanzaConectada) {
        alert('Balanza conectada exitosamente');
      } else {
        alert('No se pudo conectar con la balanza');
      }
    } catch (error) {
      console.error('Error al conectar balanza:', error);
      alert(
        'Error al conectar con la balanza. Verifica que uses Chrome/Edge y que el cable esté conectado.'
      );
    }
  }

  /**
   * Desconecta la balanza
   */
  async desconectarBalanza(): Promise<void> {
    await this.scaleService.disconnect();
    this.balanzaConectada = false;
    alert('Balanza desconectada');
  }

  /**
   * Actualiza la cantidad del producto desde el peso de la balanza
   */
  private actualizarCantidadDesdeBalanza(peso: number): void {
    // Solo actualizar si hay un producto seleccionado
    if (!this.productoSeleccionado) return;

    // Convertir el peso según la unidad (si viene en gramos y necesitas kg, por ejemplo)
    let cantidadFinal = peso;

    // Si el peso es muy pequeño, ignorarlo (evitar ruido)
    if (cantidadFinal < 0.01) return;

    // Redondear a 2 decimales
    cantidadFinal = Math.round(cantidadFinal * 100) / 100;

    // Actualizar el formulario
    this.productosForm.patchValue({
      cantidadProducto: cantidadFinal,
    });

    console.log(`Cantidad actualizada desde balanza: ${cantidadFinal}`);
  }

  abrirCamara(): void {
    this.scannerService.abrirCamara().subscribe((result) => {
      if (result) {
        console.log('Código escaneado:', result);
        this.procesarResultado(result);
      }
    });
  }

  private procesarResultado(result: string): void {
    const buscarInput = document.getElementById('codigoProducto') as HTMLInputElement;
    if (buscarInput) {
      buscarInput.value = result;
      const event = new KeyboardEvent('keyup', {
        key: 'Enter',
        code: 'Enter',
        keyCode: 13,
        which: 13,
        bubbles: true,
      });
      buscarInput.dispatchEvent(event);
    }
  }
}
