import { inject, Injectable } from "@angular/core";
import { HttpClientesService } from "../http-services/httpClientes.service";
import { catchError, Observable, of, throwError } from "rxjs";
import { AlertService } from "src/app/utils/alert.service";
import { CrearClienteDTO } from "src/app/dto/cliente/CrearClienteDTO";
import { ClienteDTO } from "src/app/dto/cliente/ClienteDTO";
import { Page } from "src/app/dto/pageable/Page";
import { ClienteDataService } from "../data-services/cliente-data.service";

/**
 * Domain service for client business logic.
 * Implements Single Responsibility Principle - handles client business operations.
 * Uses Dependency Inversion - depends on abstractions through injected services.
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private clienteService: HttpClientesService = inject(HttpClientesService);
  private alertService: AlertService = inject(AlertService);
  private clienteDataService = inject(ClienteDataService);


  crearCliente(cliente: CrearClienteDTO) {
    return this.clienteService.crearCliente(cliente).subscribe({
      next: () => this.alertService.simpleSuccessAlert("Cliente guardado correctamente"),
      error: (error) => this.alertService.simpleErrorAlert(error.error.mensaje)
    });
  }

  obtenerCliente(cedula: string): Observable<ClienteDTO | null> {
    return this.clienteService.obtenerCliente(cedula).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  /**
  * Retrieves all clients directly from the API.
  * Removed localStorage caching - now fetches directly from API.
  * @returns Observable array of ClienteDTO
  */
  public getTodosClientes(): Observable<ClienteDTO[]> {
    return this.clienteDataService.obtenerTodosLosClientes();
  }

  /**
  * Searches clients by cedula, name or id from the API.
  * @param searchTerm - The search term to filter clients
  * @returns Observable array of filtered ClienteDTO
  */
  public buscarClientes(searchTerm: string): Observable<ClienteDTO[]> {
    return this.clienteDataService.buscarClientes(searchTerm);
  }


  fueEliminado(input: string) {
    return this.clienteService.fueEliminado(input).pipe(
      catchError(() => {
        return of(null);
      })
    );
  }

  recuperarCliente(input: string) {
    return this.clienteService.recuperarCliente(input).subscribe({
      next: () => this.alertService.simpleSuccessAlert("Cliente recuperado correctamente"),
      error: (error) => this.alertService.simpleErrorAlert(error.error.mensaje)
    });
  }

  obtenerClientes(page: number): Promise<Page<ClienteDTO>> {
    return new Promise((resolve, reject) => {
      this.clienteService.obtenerClientes(page).subscribe({
        next: (page) => resolve(page),
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error.mensaje);
          reject(error);
        }
      });
    });
  }

  getClientes(page: number): Observable<Page<ClienteDTO>> {
    return this.clienteService.obtenerClientes(page).pipe(
      catchError((error) => {
        this.alertService.simpleErrorAlert(error.error.mensaje);
        return throwError(error); // Importar throwError desde 'rxjs'
      })
    );
  }


  async eliminarClienteId(id: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.clienteService.eliminarPorId(id).subscribe({
        next: () => {
          this.alertService.simpleSuccessAlert("Cliente eliminado correctamente");
          resolve();
        },
        error: (error) => {
          this.alertService.simpleErrorAlert(error.error.mensaje);
          reject(error);
        },
      });
    });
  }

  verificarExistencia(cedula: string): Observable<boolean> {
    return this.clienteService.verificarExistencia(cedula);
  }
}