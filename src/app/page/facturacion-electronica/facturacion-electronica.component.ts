import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { VentaService } from 'src/app/services/domainServices/venta.service';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { EFacturaDTO } from 'src/app/dto/efactura/EFacturaDTO';

@Component({
  selector: 'app-facturacion-electronica',
  templateUrl: './facturacion-electronica.component.html',
  styleUrl: './facturacion-electronica.component.css'
})
export class FacturacionElectronicaComponent {

  protected ventas: EFacturaDTO[];
  protected ventasFiltradas: EFacturaDTO[];
  public sumaTotal: number = 0;
  protected formulario!: FormGroup;
  private fb: FormBuilder = inject(FormBuilder);
  private ventaService: VentaService = inject(VentaService);
  private menuComponent: MenuComponent = inject(MenuComponent);
  protected paginaActual: number = 0;
  protected totalPaginas!: number;
  protected paginas: number[] = [];
  protected modoOculto: boolean = true;
  rangoVisible: number = 5; // Número de paginas que se van a mostrar en el paginador

  constructor() {
    this.ventas = [];
    this.ventasFiltradas = [];
  }

  ngOnInit() {
    this.obtenerVentas(0);
    this.buildForm();
  }

  /**
   * Método para construir el formulario
   */
  private buildForm() {
    this.formulario = this.fb.group({
      fecha: [this.getFechaActual()]
    });
  }

  /**
   * Este método se encarga de obtener las ventas de la base de datos
   * a través del servicio de ventas
   */
  private obtenerVentas(page: number) {
    this.ventaService.obtenerFacturasElectronicas(page).subscribe(data => {
      this.totalPaginas = data.totalPages;
      this.ventas = data.content;
      this.ventasFiltradas = data.content;
      this.generarPaginas();
    })
  }


  /**
   * Este método se encarga de cerrar el menu y asi
   * evita que se genere un bug con la ventana emergente
   */
  cerrarMenu() {
    if (!this.menuComponent.estadoMenu) {
      this.menuComponent.toggleCollapse();
    }
  }

  /**
   * Este método se encarga de filtrar las ventas por un valor de búsqueda
   * @param evento contiene el evento de búsqueda
   */
  protected buscar(evento: Event) {
    const input = (evento.target as HTMLInputElement).value.toLowerCase();

    this.ventasFiltradas = this.ventas.filter((venta: EFacturaDTO) => {
      const valoresBusqueda = [
        venta.id.toString(),
        venta.fecha.toString(),
        venta.cliente.toString(),
        venta.toString(),
        venta.total.toString(),
      ];

      return valoresBusqueda.some(valor => valor.toLowerCase().includes(input));
    });
  }

  /**
   * Método para filtrar las ventas por fecha
   */
  public filtrarFecha() {
    let fecha = this.formulario.get('fecha')?.value;
    this.ventasFiltradas = this.ventas.filter((venta: EFacturaDTO) =>
      venta.fecha.includes(fecha)
    );
  }

  /**
   * Establece la fecha actual en el formato 'YYYY/MM/DD'
   * @returns la fecha actual en formato 'YYYY/MM/DD' 
   */
  private getFechaActual(): string {
    const today = new Date();
    const formattedDate1 = `${today.getFullYear()}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}`;
    return formattedDate1;
  }

  /**
   * Método para obtener los datos de la base de datos
   */
  protected reset() {
    this.obtenerVentas(0);
  }


    /**
   * Este método se encarga de cambiar a la página anterior.
   * Verifica que la página actual no sea la primera antes de retroceder
   * y luego recarga los datos correspondientes a la nueva página.
   */
    paginaAnterior() {
      if (this.paginaActual > 0) {  
        this.paginaActual--;
        this.cargarVentas();
      }
    }
  
    /**
     * Este método se encarga de avanzar a la siguiente página.
     * Verifica que la página actual no sea la última antes de avanzar
     * y luego recarga los datos correspondientes a la nueva página.
     */
    paginaSiguiente() {
      if (this.paginaActual < this.totalPaginas - 1) {  
        this.paginaActual++;
        this.cargarVentas();
      }
    }
  
    /**
     * Este método devuelve un arreglo con el rango de páginas que deben mostrarse
     * en la paginación, basado en la página actual y el rangoVisible definido.
     * Permite limitar el número de botones visibles en la interfaz.
     * 
     * @returns un arreglo de números que representa las páginas visibles
     */
    get paginasVisibles(): number[] {
      const mitad = Math.floor(this.rangoVisible / 2);
      let inicio = Math.max(this.paginaActual - mitad, 0);
      let fin = Math.min(inicio + this.rangoVisible, this.totalPaginas);
    
      if (fin - inicio < this.rangoVisible) {
        inicio = Math.max(fin - this.rangoVisible, 0);
      }
    
      return Array.from({ length: fin - inicio }, (_, i) => i + inicio);
    }
  
    /**
     * Este método carga las ventas correspondientes a la página actual,
     * llamando al método obtenerProductos y pasándole la página como parámetro.
     */
    cargarVentas() {
      this.obtenerVentas(this.paginaActual);  
    }
  
    /**
     * Este método genera un arreglo con todos los números de página disponibles,
     * basado en el total de páginas. Este arreglo se utiliza para construir la paginación.
     */
    generarPaginas() {
      this.paginas = Array.from({ length: this.totalPaginas }, (_, index) => index);
    }
  
    /**
     * Este método cambia a una página específica seleccionada por el usuario
     * y recarga los datos correspondientes a esa página.
     * 
     * @param pagina número de página a la que se desea navegar
     */
    irPagina(pagina: number) {
      this.paginaActual = pagina;
      this.cargarVentas();
    }

}
