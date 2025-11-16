import { inject, Injectable } from "@angular/core";
import { HttpUsuariosService } from "../http-services/httpUsuarios.service";
import { Observable } from "rxjs";
import { AlertService } from "src/app/utils/alert.service";
import { UsuarioDTO } from "src/app/dto/usuario/UsuarioDTO";
import { CrearUsuarioDTO } from "src/app/dto/usuario/CrearUsuarioDTO";
import { ActualizarUsuarioDTO } from "src/app/dto/usuario/ActualizarUsuarioDTO";

/**
 * Domain service for user business logic.
 * Handles user business operations.
 */
@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private httpUsuariosService: HttpUsuariosService = inject(HttpUsuariosService);
  private alertService: AlertService = inject(AlertService);

  /**
   * Obtiene todos los usuarios del sistema
   */
  async obtenerUsuarios(): Promise<UsuarioDTO[]> {
    return new Promise((resolve, reject) => {
      this.httpUsuariosService.obtenerUsuarios().subscribe({
        next: (usuarios) => resolve(usuarios),
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error?.mensaje || "Error al obtener usuarios");
          reject(error);
        }
      });
    });
  }

  /**
   * Obtiene un usuario por su ID
   */
  obtenerUsuarioPorId(id: number): Observable<UsuarioDTO> {
    return this.httpUsuariosService.obtenerUsuarioPorId(id);
  }

  /**
   * Crea un nuevo usuario en el sistema
   */
  async crearUsuario(usuario: CrearUsuarioDTO): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpUsuariosService.crearUsuario(usuario).subscribe({
        next: () => {
          this.alertService.simpleSuccessAlert("Usuario creado correctamente");
          resolve();
        },
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error?.mensaje || "Error al crear usuario");
          reject(error);
        }
      });
    });
  }

  /**
   * Actualiza un usuario existente
   */
  async actualizarUsuario(usuario: ActualizarUsuarioDTO): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpUsuariosService.actualizarUsuario(usuario).subscribe({
        next: () => {
          this.alertService.simpleSuccessAlert("Usuario actualizado correctamente");
          resolve();
        },
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error?.mensaje || "Error al actualizar usuario");
          reject(error);
        }
      });
    });
  }

  /**
   * Elimina un usuario por su ID
   */
  async eliminarUsuario(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpUsuariosService.eliminarUsuario(id).subscribe({
        next: () => {
          this.alertService.simpleSuccessAlert("Usuario eliminado correctamente");
          resolve();
        },
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error?.mensaje || "Error al eliminar usuario");
          reject(error);
        }
      });
    });
  }
}
