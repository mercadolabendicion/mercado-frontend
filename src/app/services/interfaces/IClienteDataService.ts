import { Observable } from 'rxjs';
import { ClienteDTO } from 'src/app/dto/cliente/ClienteDTO';

/**
 * Interface for client data retrieval operations.
 * Following Interface Segregation Principle (SOLID).
 */
export interface IClienteDataService {
  /**
   * Retrieves all clients from the data source
   * @returns Observable array of ClienteDTO
   */
  obtenerTodosLosClientes(): Observable<ClienteDTO[]>;

  /**
   * Searches clients by cedula, name or id
   * @param searchTerm - The search term to filter clients
   * @returns Observable array of filtered ClienteDTO
   */
  buscarClientes(searchTerm: string): Observable<ClienteDTO[]>;
}
