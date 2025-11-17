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
import { UsuarioService } from 'src/app/services/domainServices/usuario.service';
import { UsuarioDTO } from 'src/app/dto/usuario/UsuarioDTO';

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
  private usuarioService: UsuarioService = inject(UsuarioService);

  public userName: string = '';
  public userPhoto: string | null = null;
  public userInitials: string = '';

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
    // Prefer to read the full UsuarioDTO saved at login from localStorage
    try {
      const raw = localStorage.getItem('usuario');
      if (raw) {
        const u: UsuarioDTO = JSON.parse(raw);
        this.userName = u.nombre || '';
        this.userPhoto = u.foto || null;
        this.userInitials = this.computeInitials(this.userName);
        return;
      }
    } catch (e) {
      // failed to parse stored user, fall back to id-fetch
    }

    // Fallback: if only id is available, fetch from API
    const idStr = localStorage.getItem('id');
    if (idStr) {
      const id = Number(idStr);
      if (!isNaN(id)) {
        this.usuarioService.obtenerUsuarioPorId(id).subscribe({
          next: (u: UsuarioDTO) => {
            this.userName = u.nombre || '';
            this.userPhoto = u.foto || null;
            this.userInitials = this.computeInitials(this.userName);
          },
          error: () => {
            // ignore error silently; user may not be available
          }
        });
      }
    }
  }

  private computeInitials(name: string): string {
    if (!name) return '';
    const parts = name.trim().split(/\s+/);
    const initials = parts.slice(0,2).map(p => p.charAt(0).toUpperCase()).join('');
    return initials;
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