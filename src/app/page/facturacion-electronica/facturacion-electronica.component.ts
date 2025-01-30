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
    this.obtenerVentas(this.paginaActual);  
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
}
