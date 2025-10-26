import { inject, Injectable } from '@angular/core';
import { environment } from '../../env/env';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CrearVentaDTO } from '../../dto/venta/CrearVentaDTO';
import { Observable } from 'rxjs';
import { VentaDTO } from '../../dto/venta/VentaDTO';
import { FullVentaDTO } from '../../dto/venta/FullVentaDTO';
import { Page } from 'src/app/dto/pageable/Page';
import { CrearEFacturaDTO } from 'src/app/dto/efactura/CrearEFacturaDTO';
import { EFacturaDTO } from 'src/app/dto/efactura/EFacturaDTO';

@Injectable({
  providedIn: 'root'
})
export class HttpVentaService {


  private URL_API: string = environment.ApiUrl;
  private http: HttpClient = inject(HttpClient);

  public obtenerVentas(page: number): Observable<Page<VentaDTO>> {
    return this.http.get<Page<VentaDTO>>(`${this.URL_API}/venta/obtener-ventas-completadas?page=${page}`);
  }

  public obtenerVentasTodas(): Observable<VentaDTO[]> {
    return this.http.get<VentaDTO[]>(`${this.URL_API}/venta/obtener-ventas`);
  }

  public generaIdVenta(): Observable<number> {
    return this.http.get<number>(`${this.URL_API}/venta/siguiente-id`);
  }

  public eliminarPorId(id: number) {
    return this.http.get(`${this.URL_API}/venta/${id}`);
  }

  public guardarFactura(factura: CrearVentaDTO) {
    return this.http.post(`${this.URL_API}/venta/guardar`, factura);
  }

  public obtenerDetalleVenta(id: number): Observable<FullVentaDTO> {
    return this.http.get<FullVentaDTO>(`${this.URL_API}/venta/${id}`);
  }

  public cancelarVenta(idVenta: number): Observable<boolean> {
    return this.http.delete<boolean>(`${this.URL_API}/venta/cancelar/${idVenta}`);
  }

  crearFacturaElectronica(efactura: CrearEFacturaDTO) {
    return this.http.post(`${this.URL_API}/efactura/guardar`, efactura);
  }

  obtenerEFacturas(page: number): Observable<Page<EFacturaDTO>> {
    return this.http.get<Page<EFacturaDTO>>(`${this.URL_API}/efactura/obtener-efacturas?page=${page}`);
  }

  /**
 * Obtiene el total de ventas para una fecha específica
 * @param fecha Fecha en formato YYYY-MM-DD
 * @returns Observable con el total de ventas (número)
 */
  public obtenerTotalVentasPorFecha(fecha: string): Observable<number> {
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<number>(`${this.URL_API}/venta/total-ventas`, { params });
  }

}
