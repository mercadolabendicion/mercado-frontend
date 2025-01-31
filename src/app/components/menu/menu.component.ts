import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/env';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { CajaComponent } from 'src/app/page/caja/caja.component';
import { ClienteService } from 'src/app/services/domainServices/cliente.service';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { ClienteDTO } from 'src/app/dto/cliente/ClienteDTO';
import { VentaDTO } from 'src/app/dto/venta/VentaDTO';
import { VentaService } from 'src/app/services/domainServices/venta.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent {

  public estadoMenu: boolean = false;
  public productos!: ProductoDTO[];
  public clientes!: ClienteDTO[];
  public ventas!: VentaDTO[];
  private router: Router = inject(Router);
  protected nombreNegocio: string = environment.nombreNegocio;
  private productoService: ProductoService = inject(ProductoService);
  private clienteService: ClienteService= inject(ClienteService);
  private ventaService: VentaService= inject(VentaService);

  /**
   * Metodo que se encarga de colapsar el menu
   */
  public toggleCollapse(): void {
    const sidebar = document.querySelector("#sidebar") as HTMLElement;
    sidebar.classList.toggle("collapsed");
    this.estadoMenu = !this.estadoMenu
  }
  /**
   * Metodo que se encarga de navegar a la pagina principal
   * para cerrar la sesion
   */
  ngOnInit(): void {
    this.productoService.getTodosProductos();
    this.clienteService.getTodosClientes();
    this.llenarLocalStorage();
    this.router.navigate(['/app/principal']);
  }

  /**
   * Metodo que se encarga de cerrar la sesion
   * eliminando el token del localstorage
   */
  protected salir() {
    localStorage.removeItem('id');
    this.router.navigate(['/login']);
  }

  public cerrarMenu() {

    if (!this.estadoMenu) {
      this.toggleCollapse();
    }
  }

  /**
   * Este metodo llena las listas en localStore
   */
  public llenarLocalStorage(): void {
    this.listarProductos();
    this.listarClientes();
    this.listarVentas();
  }

  /**
   * Este método se encarga de listar todos los productos disponibles en la base de datos,
   * haciendo solicitudes hasta que no se reciban más productos.
   */
  public listarProductos(): void {
    let page = 0;
    this.productos = [];

    const obtenerProductosRecursivamente = (paginaActual: number): void => {
      this.productoService.getProductos(paginaActual).subscribe({
        next: (data) => {
          // Si hay productos en la página actual, se agregan a la lista de productos
          if (data.content.length > 0) {
            this.productos = [...this.productos, ...data.content];
            obtenerProductosRecursivamente(paginaActual + 1); // Llama a la siguiente página
          } else {
            console.log('Todos los productos han sido cargados:', this.productos.length);
          }
        },
        error: (err) => {
          console.error('Error al listar productos:', err);
        }
      });
    };

    // Comienza a obtener productos desde la primera página
    obtenerProductosRecursivamente(page);
  }


  /**
   * Este método se encarga de listar todos los clientes disponibles en la base de datos,
   * haciendo solicitudes hasta que no se reciban más productos.
   */
  public listarClientes(): void {
    let page = 0;
    this.clientes = [];

    const obtenerClientesRecursivamente = (paginaActual: number): void => {
      this.clienteService.getClientes(paginaActual).subscribe({
        next: (data) => {
          // Si hay clientes en la página actual, se agregan a la lista de clientes
          if (data.content.length > 0) {
            this.clientes = [...this.clientes, ...data.content];
            obtenerClientesRecursivamente(paginaActual + 1); // Llama a la siguiente página
          } else {
            console.log('Todos los clientes han sido cargados:', this.clientes.length);
          }
        },
        error: (err) => {
          console.error('Error al listar clientes:', err);
        }
      });
    };

    // Comienza a obtener productos desde la primera página
    obtenerClientesRecursivamente(page);
  }

  /**
   * Este metodo se encarga de listar todos las ventas disponibles en la base de datos,
   * haciendo solicitudes hasta que no se reciban más ventas.
   */
  public listarVentas(): void {
    let page = 0;
    this.ventas = [];

    const obtenerVentasRecursivamente = (paginaActual: number): void => {
      this.ventaService.obtenerVentas(paginaActual).subscribe({
        next: (data) => {
          // Si hay ventas en la página actual, se agregan a la lista de ventas
          if (data.content.length > 0) {
            this.ventas = [...this.ventas, ...data.content];
            obtenerVentasRecursivamente(paginaActual + 1); // Llama a la siguiente página
          } else {
            console.log('Todas las ventas han sido cargadas:', this.ventas.length);
          }
        },
        error: (err) => {
          console.error('Error al listar ventas:', err);
        }
      });
    };

    // Comienza a obtener ventas desde la primera página
    obtenerVentasRecursivamente(page);
  }
}