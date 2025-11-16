import { Component, inject } from '@angular/core';
import { UsuarioDTO } from '../../../dto/usuario/UsuarioDTO';
import { UsuarioService } from 'src/app/services/domainServices/usuario.service';
import { MenuComponent } from '../../menu/menu.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-home-usuario',
  templateUrl: './home-usuario.component.html',
  styleUrls: ['./home-usuario.component.css']
})
export class HomeUsuarioComponent {

  protected usuarios: UsuarioDTO[];
  protected usuarioEditar: UsuarioDTO;
  protected filtroUsuarios: UsuarioDTO[];
  protected modoOculto: boolean = true;
  protected totalUsuarios: number;
  private usuarioService: UsuarioService = inject(UsuarioService);
  private menuComponent: MenuComponent = inject(MenuComponent);

  constructor() {
    this.usuarioEditar = {} as UsuarioDTO;
    this.usuarios = [];
    this.filtroUsuarios = [];
    this.totalUsuarios = 0;
  }

  ngOnInit() {
    this.obtenerUsuarios();
  }

  /**
   * Actualiza el total de usuarios en la tabla
   */
  private updateUsuarioCount(): void {
    this.totalUsuarios = this.filtroUsuarios.length;
  }

  /**
   * Obtiene los usuarios del servicio y los asigna a la variable usuarios
   */
  private obtenerUsuarios(): void {
    this.usuarioService.obtenerUsuarios().then((usuarios) => {
      this.usuarios = usuarios;
      this.filtroUsuarios = usuarios;
      this.updateUsuarioCount();
    }).catch((error) => {
      console.error('Error al obtener usuarios:', error);
    });
  }

  /**
   * Elimina un usuario por su id, muestra un mensaje de confirmación antes de eliminar
   * @param id 
   */
  protected async eliminarPorId(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "No podrás revertir esta acción",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await this.usuarioService.eliminarUsuario(id);
        this.obtenerUsuarios();
      } catch (error) { 
        console.error('Error al eliminar usuario:', error);
      }
    }
  }

  /**
   * Busca un usuario por su nombre, email o id.
   * @param event evento de entrada
   */
  protected buscar(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const busqueda = inputElement.value.trim().toLowerCase();

    if (!busqueda || busqueda === '') {
      this.filtroUsuarios = this.usuarios;
      this.updateUsuarioCount();
      return;
    }

    this.filtroUsuarios = this.usuarios.filter(usuario => 
      usuario.nombre?.toLowerCase().includes(busqueda) ||
      usuario.email?.toLowerCase().includes(busqueda) ||
      usuario.id.toString().includes(busqueda)
    );
    this.updateUsuarioCount();
  }

  /**
   * Cambia el modo de edición de la tabla
   * @param usuario 
   */
  protected toggleModoEdicion(usuario: UsuarioDTO) {
    this.usuarioEditar = usuario;
    this.editarModoOcuto();
  }

  /**
   * Cambia del modo de edición al modo oculto
   */
  protected editarModoOcuto() {
    this.modoOculto = !this.modoOculto;
    this.obtenerUsuarios();
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
