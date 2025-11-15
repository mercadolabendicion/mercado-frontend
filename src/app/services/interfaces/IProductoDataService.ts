import { Observable } from 'rxjs';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';

/**
 * Interface for product data retrieval operations.
 * Following Interface Segregation Principle (SOLID).
 */
export interface IProductoDataService {
  /**
   * Retrieves all products from the data source
   * @returns Observable array of ProductoDTO
   */
  obtenerTodosLosProductos(): Observable<ProductoDTO[]>;

  /**
   * Searches products by code or name
   * @param searchTerm - The search term to filter products
   * @returns Observable array of filtered ProductoDTO
   */
  buscarProductos(searchTerm: string): Observable<ProductoDTO[]>;
}
