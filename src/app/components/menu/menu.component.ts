import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/app/env/env';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { ClienteService } from 'src/app/services/domainServices/cliente.service';
import { ProductoService } from 'src/app/services/domainServices/producto.service';
import { ClienteDTO } from 'src/app/dto/cliente/ClienteDTO';
import { VentaDTO } from 'src/app/dto/venta/VentaDTO';
import { VentaService } from 'src/app/services/domainServices/venta.service';
import { AuthService } from 'src/app/services/shared/auth.service';

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
  private authService: AuthService = inject(AuthService);

  /**
   * Metodo que se encarga de colapsar el menu
   */
  public toggleCollapse(): void {
    const sidebar = document.querySelector("#sidebar") as HTMLElement;
    sidebar.classList.toggle("collapsed");
    this.estadoMenu = !this.estadoMenu
  }

  /**
   * Inicializa el componente del menú.
   * Removed localStorage caching - data is now fetched on-demand from API.
   */
  ngOnInit(): void {
    this.router.navigate(['/app/principal']);
  }

  /**
   * Metodo que se encarga de cerrar la sesion
   * eliminando el token del localstorage y la cookie JWT
   */
  protected salir() {
    localStorage.removeItem('id');
    this.authService.clearToken();
    this.router.navigate(['/login']);
  }

  public abrirMenu() {
      this.toggleCollapse();
  }

  /**
   * Methods removed - data is now fetched on-demand from components.
   * Removed to avoid unnecessary API calls and follow SOLID principles.
   */

}