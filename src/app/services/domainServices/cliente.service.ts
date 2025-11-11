import { inject, Injectable } from "@angular/core";
import { HttpClientesService } from "../http-services/httpClientes.service";
import { catchError, Observable, of, throwError } from "rxjs";
import { AlertService } from "src/app/utils/alert.service";
import { CrearClienteDTO } from "src/app/dto/cliente/CrearClienteDTO";
import { ClienteDTO } from "src/app/dto/cliente/ClienteDTO";
import { Page } from "src/app/dto/pageable/Page";
import { LocalStorageService } from "../shared/local-storage.service";

@Injectable({
  providedIn: 'root'
})
export class ClienteService {

  private clienteService: HttpClientesService = inject(HttpClientesService);
  private alertService: AlertService = inject(AlertService);
  private localStorageService = inject(LocalStorageService);


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
  * Este método se encarga de obtener los clientes de la base de datos
  */
  public getTodosClientes(): void {
    this.clienteService.getTodosLosClientes().subscribe({
      next: (resp) => {
        this.localStorageService.setItem('clientes', resp);
      },
    });
  }

  /**
  * Este metodo obtiene los clientes del LocalStorage
  * devuelve una lista de ClientesDTO
  */
  obtenerClienteLocal(): ClienteDTO[] {
    return this.localStorageService.getItemOrDefault<ClienteDTO[]>('clientes', []);
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