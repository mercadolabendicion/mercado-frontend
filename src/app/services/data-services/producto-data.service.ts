import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IProductoDataService } from '../interfaces/IProductoDataService';
import { ProductoDTO } from 'src/app/dto/producto/ProductoDTO';
import { HttpProductoService } from '../http-services/httpProductos.service';

/**
 * Service for retrieving product data directly from API.
 * Implements Single Responsibility Principle - only handles product data retrieval.
 * Implements Dependency Inversion Principle - depends on abstraction (IProductoDataService).
 */
@Injectable({
  providedIn: 'root'
})
export class ProductoDataService implements IProductoDataService {
  private httpProductoService = inject(HttpProductoService);

  /**
   * Retrieves all products from the API
   * @returns Observable array of ProductoDTO
   */
  obtenerTodosLosProductos(): Observable<ProductoDTO[]> {
    return this.httpProductoService.getTodosLosProductos();
  }

  /**
   * Searches products by code or name directly from API
   * @param searchTerm - The search term to filter products
   * @returns Observable array of filtered ProductoDTO
   */
  buscarProductos(searchTerm: string): Observable<ProductoDTO[]> {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    
    return this.obtenerTodosLosProductos().pipe(
      map(productos => productos.filter(producto => 
        this.coincideConBusqueda(producto, lowerSearchTerm)
      ))
    );
  }

  /**
   * Helper method to check if a product matches the search term
   * @param producto - Product to check
   * @param searchTerm - Search term to match
   * @returns true if product matches search term
   */
  private coincideConBusqueda(producto: ProductoDTO, searchTerm: string): boolean {
    return (
      producto.codigo.toString().toLowerCase().includes(searchTerm) ||
      producto.nombre.toLowerCase().includes(searchTerm)
    );
  }
}
