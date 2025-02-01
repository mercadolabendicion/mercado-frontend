import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../env/env';
import { ProductoDTO } from '../../dto/producto/ProductoDTO';
import { ActualizarProductoDTO } from '../../dto/producto/ActualizarProductoDTO';
import { CrearProductoDTO } from '../../dto/producto/CrearProductoDTO';
import { Page } from 'src/app/dto/pageable/Page';
import { ProductoCompletoDTO } from 'src/app/dto/producto/ProductoCompletoDTO';
import { FormaVenta } from 'src/app/dto/formasVenta/FormaVenta';
import { ActualizarFormaVentaCompletoDTO } from 'src/app/dto/producto/ActualizarFormaVentaCompletoDTO';
@Injectable({
  providedIn: 'root'
})
export class HttpProductoService {

  private URL_API: string = environment.ApiUrl;
  private http: HttpClient = inject(HttpClient);

  public getProductos(page:number): Observable<Page<ProductoDTO>> {
    return this.http.get<Page<ProductoDTO>>(`${this.URL_API}/productos?page=${page}&size=15`);
  }

  public getTipoImpuesto(): Observable<string[]>  {
    return this.http.get<string[]>(`${this.URL_API}/productos/tipos-impuestos`);
  }

  public enviarDatos(producto: CrearProductoDTO) {
    return this.http.post(`${this.URL_API}/productos/guardar`, producto);
  }

  public eliminarPorCodigo(codigo: string) {
    const url = `${this.URL_API}/productos/eliminar/${codigo}`;
    return this.http.delete(url);
  }

  public actualizar(producto: ActualizarProductoDTO) {
    return this.http.put(`${this.URL_API}/productos/actualizar`, producto);
  }

  public verificarExistencia(codigo: string):Observable<boolean> {
    return this.http.get<boolean>(`${this.URL_API}/productos/verificar-cod-producto/${codigo}`);
  }

  public verificarCantidad(cantidad: number, codigo: string, formaVenta:string):Observable<boolean> {
    return this.http.get<boolean>(`${this.URL_API}/productos/verificar-cantidad/${cantidad}/${codigo}/${formaVenta}`);
  }

  public verificarCambios():Observable<boolean> {
    return this.http.get<boolean>(`${this.URL_API}/productos/verificar-cambios`); 
  }

  public fueEliminado(value: string) {
    return this.http.get<boolean>(`${this.URL_API}/productos/fue-eliminado/${value}`);
  }
  public recuperarProducto(input: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.URL_API}/productos/recuperar-producto/${input}`);
  }

  obtenerProductoPorCodigo(codigo: string): Observable<ProductoDTO> {
    return this.http.get<ProductoDTO>(`${this.URL_API}/productos/obtener-producto/${codigo}`);
  }

  getTodosLosProductos(): Observable<ProductoDTO[]> {
    return this.http.get<ProductoDTO[]>(`${this.URL_API}/productos/todos`);
  }

  obtenerProductoCompleto(codigo: string): Observable<ProductoCompletoDTO> {
    return this.http.get<ProductoCompletoDTO>(`${this.URL_API}/productos/obtener-producto-completo/${codigo}`);
  }

  obtenerFormasVentaByCodigo(codigo: string): Observable<FormaVenta[]> {
    return this.http.get<FormaVenta[]>(`${this.URL_API}/productos/obtener-formas-venta/${codigo}`);
  }

  actualizarFormaVenta(formaVenta: ActualizarFormaVentaCompletoDTO): Observable<void> {
    return this.http.put<void>(`${this.URL_API}/productos/actualizar-forma-venta`, formaVenta);
  }
}
