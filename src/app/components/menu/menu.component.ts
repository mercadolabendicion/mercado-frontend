import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/env';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
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

  public estadoMenu: boolean = true;
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
    this.ventaService.obtenerVentasTodas();
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
    if (this.estadoMenu) {
      this.toggleCollapse();
    }
  }

  public abrirMenu() {
      this.toggleCollapse();
  }

  public listarClientes() {
    this.clienteService.getTodosClientes();
  }

  public listarProductos() {
    this.productoService.getTodosProductos();
  }

  public listarVentas() {
    this.ventaService.obtenerVentasTodas();
  }

}