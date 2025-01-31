import { Component, inject } from '@angular/core';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { ProductoAlertService } from 'src/app/utils/product-alert/productoAlert.service';
import { MenuComponent } from '../../menu/menu.component';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActualizarProductoDTO } from 'src/app/dto/producto/ActualizarProductoDTO';
import { ActualizarFormaVentaDTO } from 'src/app/dto/producto/ActualizarFormaVentaDTO';
@Component({
  selector: 'app-home-producto',
  templateUrl: './home-producto.component.html',
  styleUrls: ['./home-producto.component.css']
})
export class HomeProductoComponent {

  private productos: ProductoDTO[];
  private productosTodos!: ProductoDTO[];
  protected productosEditar!: ProductoDTO;
  protected filtroProductos: ProductoDTO[];
  protected modoOculto: boolean = true;
  protected productoAuxActualizar: ProductoDTO | null = null;
  protected ProductoNuevoActualizado: ProductoDTO | null = null; // Para almacenar el producto actualizado
  protected totalProductos: number = 0;
  modalAbierto = false;
  modalAbiertoEditar = false;
  productoSeleccionado!: ProductoCompletoDTO;
  private productoService: ProductoService = inject(ProductoService);
  private productoAlert: ProductoAlertService = inject(ProductoAlertService);
  private menuComponent: MenuComponent = inject(MenuComponent);
  protected paginaActual: number = 0;
  protected totalPaginas!: number;
  protected paginas: number[] = [];
  actualizarProductoForm!: FormGroup;
  valorFormateado: string = ''; // Para almacenar el valor con formato de dinero 
  protected valorDescuento: string | null = null;
  descuento: number = 0;


  constructor(private fb: FormBuilder) {
    this.productos = [];
    this.filtroProductos = [];
  }


  ngOnInit() {
    this.obtenerProductos(0);
    this.obtenerProductosTodos();
    this.updateProductoCount();
    this.actualizarProductoForm = this.fb.group({
      codigo: [Validators.required],
      nombre: [Validators.required],
      impuesto: [[Validators.required, Validators.min(0)]],
      fechaCreacion: [Validators.required],
      formaCantidad: [Validators.required]
    });
    this.menuComponent.listarProductos();
  }

  /**
   * Este metodo se encarga de guardar en la variable productosTodos
   * todos los productos que se encuentran en LocalStorage con la variable productos
   */
  obtenerProductosTodos() {
    this.productosTodos = JSON.parse(localStorage.getItem('productos') || '[]');
  }


  /**
   * Este método se encarga de actualizar el contador de productos
   */
  private updateProductoCount() {
    this.totalProductos = this.filtroProductos.length;
  }

  /**
   * Este método se encarga de obtener los productos de la base de datos
   */
  private obtenerProductos(page: number) {
    this.productoService.getProductos(page).subscribe(data => {
      this.productos = data.content;
      this.filtroProductos = data.content.sort((a: any, b: any) => a.cantidad - b.cantidad);
      this.totalPaginas = data.totalPages;
      this.updateProductoCount();
      this.generarPaginas();
    });
  }
  /**
   * Este método se encarga de eliminar un producto de la base de datos
   * @param id es el id del producto a eliminar
   */
  protected async eliminarProductoCodigo(codigo: string) {
    const result = await this.productoAlert.eliminarProducto();
    if (result) {
      try {
        await this.productoService.eliminarProductoCodigo(codigo);
        this.obtenerProductos(0);
      } catch (error) { }
    }
  }

  /**
   * Este método se encarga de buscar un producto por su código o nombre
   * @param texto 
   */
  buscar(evento: Event): void {
    const input = (evento.target as HTMLInputElement).value.toLowerCase();

    this.filtroProductos = this.productosTodos.filter((producto: ProductoDTO) =>
      this.coincideConBusqueda(producto, input)
    ).sort((a: any, b: any) => a.cantidad - b.cantidad);

    this.updateProductoCount();
  }
  /**
   * Este método se encarga de verificar si un producto coincide con la búsqueda
   * @param producto  producto a verificar
   * @param texto  texto de búsqueda
   * @returns  un booleano que indica si el producto coincide con la búsqueda
   */
  private coincideConBusqueda(producto: ProductoDTO, texto: string): boolean {
    const { codigo, nombre } = producto;
    return (
      codigo.toString().toLowerCase().includes(texto) ||
      nombre.toLowerCase().includes(texto)
    );
  }

  /**
   * Este método se encarga de cambiar el modo de edición de un producto
   * y mostrar el formulario de edición a través de un modal
   * @param producto es el producto a editar
   */
  protected toggleModoEdicion(producto: ProductoDTO) {
    this.productosEditar = producto;
    this.editarModoOcuto()
  }

  /**
   * Este método se encarga de cambiar el modo de edición de un producto
   * @returns void
   */
  protected editarModoOcuto() {
    this.modoOculto = !this.modoOculto;
    this.obtenerProductos(0);
  }

  paginaAnterior() {
    if (this.paginaActual > 0) {
      this.paginaActual--;
      this.cargarVentas();
    }
  }

  paginaSiguiente() {
    if (this.paginaActual < this.totalPaginas - 1) {
      this.paginaActual++;
      this.cargarVentas();
    }
  }

  cargarVentas() {
    this.obtenerProductos(this.paginaActual);
  }

  // Función para generar el array de páginas según el total de páginas
  generarPaginas() {
    this.paginas = Array.from({ length: this.totalPaginas }, (_, index) => index);
  }

  // Función para ir a una página específica
  irPagina(pagina: number) {
    this.paginaActual = pagina;
    this.cargarVentas();
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

  abrirModalEditar(codigo: string): void {
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
    this.modalAbiertoEditar = true;
  }

  actualizarProducto(): void {
    let codigo = this.productoSeleccionado.codigo;
    let nombre = this.productoSeleccionado.nombre;
    let impuesto = this.productoSeleccionado.impuesto;
    let fechaCreacion = this.productoSeleccionado.fechaCreacion;
    let formaNombre = '';
    let formaPrecioCompra = 0;
    let formaPrecioVenta = 0;
    let formaCantidad = 0;
    let activo = true;

    if (this.productoSeleccionado.formaVentas && this.productoSeleccionado.formaVentas.length > 0) {
      console.log("📦 Formas de Venta:");
      this.productoSeleccionado.formaVentas.forEach((forma, index) => {
        console.log(`🔹 Forma ${index + 1}:`);
        formaNombre = forma.nombre;
        console.log("   - Nombre:", formaNombre);
        formaPrecioCompra = forma.precioCompra;
        console.log("   - Precio de compra:", formaPrecioCompra);
        formaPrecioVenta = forma.precioVenta;
        console.log("   - Precio de venta:", formaPrecioVenta);
        formaCantidad = forma.cantidad;
        console.log("   - Cantidad:", formaCantidad);
      });
    } else {
      console.log("⚠️ No hay formas de venta registradas.");
    }

    if (this.actualizarProductoForm.valid) {
      //let producto = ActualizarProductoDTO.actualizarProducto(codigo, nombre, impuesto, activo);
      const producto = this.actualizarProductoForm.getRawValue();
      this.productoService.actualizar(producto).subscribe({
        next: () => {
          this.cerrarModalEditar();
        },
        error: (err: any) => {
          console.error('Error al actualizar el producto:', err);
        }
      });

      let datosFormaVenta = ActualizarFormaVentaDTO.actualizarFormaVenta(formaNombre, formaPrecioCompra, formaPrecioVenta, formaCantidad);

    } else {
      console.log('Formulario inválido');
    }

  }


  cerrarModal(): void {
    this.modalAbierto = false;
  }

  cerrarModalEditar(): void {
    this.modalAbiertoEditar = false;
  }

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

}
