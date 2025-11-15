import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IClienteDataService } from '../interfaces/IClienteDataService';
import { ClienteDTO } from 'src/app/dto/cliente/ClienteDTO';
import { HttpClientesService } from '../http-services/httpClientes.service';

/**
 * Service for retrieving client data directly from API.
 * Implements Single Responsibility Principle - only handles client data retrieval.
 * Implements Dependency Inversion Principle - depends on abstraction (IClienteDataService).
 */
@Injectable({
  providedIn: 'root'
})
export class ClienteDataService implements IClienteDataService {
  private httpClientesService = inject(HttpClientesService);

  /**
   * Retrieves all clients from the API
   * @returns Observable array of ClienteDTO
   */
  obtenerTodosLosClientes(): Observable<ClienteDTO[]> {
    return this.httpClientesService.getTodosLosClientes();
  }

  /**
   * Searches clients by cedula, name or id directly from API
   * @param searchTerm - The search term to filter clients
   * @returns Observable array of filtered ClienteDTO
   */
  buscarClientes(searchTerm: string): Observable<ClienteDTO[]> {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    return this.obtenerTodosLosClientes().pipe(
      map(clientes => clientes.filter(cliente => 
        this.coincideBusqueda(cliente, lowerSearchTerm)
      ))
    );
  }

  /**
   * Helper method to check if a client matches the search term
   * @param cliente - Client to check
   * @param searchTerm - Search term to match
   * @returns true if client matches search term
   */
  private coincideBusqueda(cliente: ClienteDTO, searchTerm: string): boolean {
    return (
      cliente.id.toString().includes(searchTerm) ||
      cliente.cedula.toLowerCase().includes(searchTerm) ||
      cliente.nombre.toLowerCase().includes(searchTerm)
    );
  }
}
