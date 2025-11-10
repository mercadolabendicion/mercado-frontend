import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { ClienteDTO } from '../../../dto/cliente/ClienteDTO';
import { ClienteAlertService } from 'src/app/utils/cliente-alert/clienteAlert.service';
import { ClienteService } from 'src/app/services/domainServices/cliente.service';
import { MenuComponent } from '../../menu/menu.component';
import { PaginationService } from 'src/app/services/shared/pagination.service';

@Component({
  selector: 'app-home-cliente',
  templateUrl: './home-cliente.component.html',
  styleUrls: ['./home-cliente.component.css']
})
export class HomeClienteComponent {

  protected clientes: ClienteDTO[];
  private clientesTodos!: ClienteDTO[];
  protected personaEditar: ClienteDTO;
  protected filtroClientes: ClienteDTO[];
  protected modoOculto: boolean = true;
  /* La variable totalClientes se utiliza para mostrar el total de clientes en la tabla
  No es igual a la longitud de filtroClientes porque filtroClientes se actualiza con la búsqueda */
  protected totalClientes: number;
  private alertClient: ClienteAlertService = inject(ClienteAlertService);
  private clienteService: ClienteService = inject(ClienteService);
  private menuComponent: MenuComponent = inject(MenuComponent);
  private paginationService = inject(PaginationService);
  protected paginaActual: number = 0;
  protected totalPaginas!: number;
  protected paginas: number[] = [];
  rangoVisible: number = 5; // Número de paginas que se van a mostrar en el paginador

  constructor() {
    this.personaEditar = new ClienteDTO();
    this.clientes = [];
    this.filtroClientes = [];
    this.totalClientes = 0;
  }

  ngOnInit() {
    this.rangoVisible = this.paginationService.calcularRangoVisible();
    this.obtenerClientes(this.paginaActual);
    this.obtenerClientesTodos();
    this.updateClienteCount();
    this.menuComponent.listarClientes();
  }

  /**
   * Actualiza el total de clientes en la tabla
   * Se llama cada vez que se actualiza filtroClientes que es el arreglo que se muestra en la tabla
   * cuando se realiza una búsqueda
   */
  private updateClienteCount(): void {
    this.totalClientes = this.filtroClientes.length;
  }

  /**
   * Este metodo se encarga de guardar en la variable clientesTodos
   * todos los clientes que se encuentran en LocalStorage con la variable clientes
   */
  obtenerClientesTodos() {
    this.clientesTodos = JSON.parse(localStorage.getItem('clientes') || '[]');
  }

  /**
   * Obtiene los clientes del servicio y los asigna a la variable clientes
   */
  private obtenerClientes(page: number): void {
    this.clienteService.obtenerClientes(page).then((page) => {
      this.clientes = page.content;
      this.filtroClientes = page.content;
      this.totalPaginas = page.totalPages;
      this.updateClienteCount();
      this.generarPaginas();
    });
  }

  /**
   * Elimina un cliente por su id, muestra un mensaje de confirmación antes de eliminar
   * La cedula es diferente al id, el id es un número único que se asigna a cada cliente
   * @param id 
   */
  protected async eliminarPorId(id: number): Promise<void> {
    const result = await this.alertClient.eliminarCliente();
    if (result) {
      try {
        await this.clienteService.eliminarClienteId(id);
        this.obtenerClientes(this.paginaActual);
      } catch (error) { }
    }
  }

  /**
   * Busca un cliente por su cedula, nombre o id
   * @param cedula 
   */
  protected buscar(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const busqueda = inputElement.value.trim().toLowerCase();

    this.filtroClientes = this.clientesTodos.filter((cliente: ClienteDTO) =>
      this.coincideBusqueda(cliente, busqueda)
    );

    this.updateClienteCount();
  }

  /**
   * Este método verifica si un cliente coincide con la búsqueda
   * @param cliente DTO del cliente
   * @param busqueda String de búsqueda
   * @returns boolean que indica si el cliente coincide con la búsqueda
   */
  private coincideBusqueda(cliente: ClienteDTO, busqueda: string): boolean {
    return (
      cliente.id.toString().includes(busqueda) ||
      cliente.cedula.toLowerCase().includes(busqueda) ||
      cliente.nombre.toLowerCase().includes(busqueda)
    );
  }


  /**
   * Cambia el modo de edición de la tabla
   * Si el modo de edición está activo, se desactiva y viceversa
   * @param persona 
   */
  protected toggleModoEdicion(persona: ClienteDTO) {
    this.personaEditar = persona;
    this.editarModoOcuto();
  }

  /**
   * Cambia del modo de edición al modo oculto
   */
  protected editarModoOcuto() {
    this.modoOculto = !this.modoOculto;
    this.obtenerClientes(this.paginaActual);
  }

  /**
   * Este método se encarga de cambiar a la página anterior.
   * Verifica que la página actual no sea la primera antes de retroceder
   * y luego recarga los datos correspondientes a la nueva página.
   */
  paginaAnterior() {
    if (this.paginationService.puedeRetroceder(this.paginaActual)) {
      this.paginaActual--;
      this.cargarClientes();
    }
  }

  /**
   * Este método se encarga de avanzar a la siguiente página.
   * Verifica que la página actual no sea la última antes de avanzar
   * y luego recarga los datos correspondientes a la nueva página.
   */
  paginaSiguiente() {
    if (this.paginationService.puedeAvanzar(this.paginaActual, this.totalPaginas)) {
      this.paginaActual++;
      this.cargarClientes();
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
    return this.paginationService.obtenerPaginasVisibles(
      this.paginaActual,
      this.totalPaginas,
      this.rangoVisible
    );
  }

  /**
   * Este método carga las ventas correspondientes a la página actual,
   * llamando al método obtenerProductos y pasándole la página como parámetro.
   */
  cargarClientes() {
    this.obtenerClientes(this.paginaActual);
  }

  /**
   * Este método genera un arreglo con todos los números de página disponibles,
   * basado en el total de páginas. Este arreglo se utiliza para construir la paginación.
   */
  generarPaginas() {
    this.paginas = this.paginationService.generarPaginas(this.totalPaginas);
  }

  /**
   * Este método cambia a una página específica seleccionada por el usuario
   * y recarga los datos correspondientes a esa página.
   * 
   * @param pagina número de página a la que se desea navegar
   */
  irPagina(pagina: number) {
    this.paginaActual = pagina;
    this.cargarClientes();
  }

  /**
   * Si el menú lateral está cerrado, lo vuelve a abrir automáticamente.
   */
  cerrarModal(): void {
    if (!this.menuComponent.estadoMenu) {
      this.menuComponent.abrirMenu();
    }
  }
}
