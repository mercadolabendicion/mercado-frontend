import { inject, Injectable } from "@angular/core";
import { ClienteService } from "./cliente.service";
import { map, Observable, Subject, of } from "rxjs";
import { HttpVentaService } from "../http-services/httpVenta.service";
import { AlertService } from "src/app/utils/alert.service";
import { CrearVentaDTO } from "src/app/dto/venta/CrearVentaDTO";
import { ClienteDTO } from "src/app/dto/cliente/ClienteDTO";
import { ProductoDTO } from "src/app/dto/producto/ProductoDTO";
import { DetalleVentaDTO } from "src/app/dto/detalleVenta/DetalleVentaDTO";
import { VentaDTO } from "src/app/dto/venta/VentaDTO";
import { FullVentaDTO } from "src/app/dto/venta/FullVentaDTO";
import { Page } from "src/app/dto/pageable/Page";
import { CarritoProductoDTO } from "src/app/dto/producto/CarritoProductoDTO";
import { CrearEFacturaDTO } from "src/app/dto/efactura/CrearEFacturaDTO";
import { EFacturaDTO } from "src/app/dto/efactura/EFacturaDTO";
import { lastValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class VentaService {


  private httpVentaService: HttpVentaService = inject(HttpVentaService);
  private alert: AlertService = inject(AlertService);
  private clientService: ClienteService = inject(ClienteService);
  private dinero: number;

  constructor() {
    this.dinero = 0;
  }

  /**
   * Este metodo se encarga de crear una venta y guardarla en la base de datos
   * @param venta es el DTO de la venta que se va a guardar
   * @param total es el total de la venta
   * @returns un observable de tipo void
   */

  public crearVenta(venta: CrearVentaDTO, total: number): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.alert.simpleInputAlert().then((result) => {
        if (!this.validarDinero(result, total)) {
          resolve(false);
          return;
        }
        if (!this.verificarExistenciaCliente(venta.cliente)) {
          resolve(false);
          return;
        }

        try {
          venta.dineroRecibido = result;
          venta.cambio = this.dinero - total;

          // Asegurar que `guardarVenta()` también retorne una promesa
          this.guardarVenta(venta, total)
            .then(() => resolve(true))
            .catch((error) => reject(error)); // En caso de fallo, se rechaza la promesa
        } catch (error) {
          reject(error);
        }
      }).catch((error) => reject(error)); // Manejar errores en `simpleInputAlert()`
    });
  }


  /**
   * Este metodo se encarga de validar el dinero ingresado por el usuario
   * Valida que el valor ingresado sea un número y que sea mayor o igual al total de la factura
   * @param result es la respuesta del input alert
   * @param total  es el total de la factura
   * @param dinero es el dinero ingresado por el usuario
   * @returns un booleano que indica si el dinero es valido
   */
  private validarDinero(result: number, total: number): boolean {

    let isValid = true;

    if (result == null || result == undefined) {
      this.alert.simpleErrorAlert('No se ha ingresado un valor');
      return !isValid;
    }

    if (isNaN(Number(result))) {
      this.alert.simpleErrorAlert('El valor ingresado no es un número');
      return !isValid;
    }

    if (result) this.dinero = Number(result);
    if (this.dinero < total) {
      this.alert.simpleErrorAlert('El dinero ingresado es menor al total de la factura');
      return !isValid;
    }

    return isValid;

  }

  /**
   * Este metodo se encarga de guardar la venta en la base de datos
   * @param venta DTO de la venta 
   * @param total  total de la venta
   * @param dinero dinero ingresado por el usuario
   */
  private guardarVenta(venta: CrearVentaDTO, total: number): Promise<void> {
    return lastValueFrom(this.httpVentaService.guardarFactura(venta)).then(() => {
      this.mostrarCambio(total);
    }).catch(error => {
      this.alert.simpleErrorAlert(error.error.mensaje);
      throw error; // Rechaza la promesa si hay error
    });
  }

  /**
   * Este metodo se encarga de mostrar el cambio al usuario 
   * @param dinero Cantidad de dinero dada por el usuario
   * @param total Total de la factura
   */
  private mostrarCambio(total: number) {
    this.alert.simpleSuccessAlert(
      'El cambio es: $ ' + Math.floor(this.dinero - total).toLocaleString('en-US')
    );
  }

  /**
   * Este metodo se encarga de verificar si un cliente existe en la base de datos
   * @param cedula  cedula del cliente
   * @returns 
   */
  public verificarExistenciaCliente(cedula: string): boolean {
    let existe = true;
    this.clientService.verificarExistencia(cedula).subscribe(
      response => {
        if (!response) {
          this.alert.simpleErrorAlert('El cliente con esa cedula no se ha encontrado');
          existe = false;
        }
      });
    return existe;
  }

  /**
   * Este metodo se encarga de obtener un cliente de la base de datos
   * @param cedula cedula del cliente
   * @returns un observable de tipo ClienteDTO o null
   */
  public obtenerCliente(cedula: string): Observable<ClienteDTO | null> {
    return this.clientService.obtenerCliente(cedula).pipe(
      map(response => { return response; })
    );
  }

  /**
   * Este metodo se encarga de agregar los productos que se agregaron al carrito a la factura
   * @param venta DTO de la factura que se va a guardar
   * @param listProductos lista de productos que se agregaron al carrito
   * @returns un booleano que indica si se agregaron los productos correctamente
   */
  public agregarProductosVenta(venta: CrearVentaDTO, listProductos: CarritoProductoDTO[]): boolean {
    if (listProductos.length == 0) {
      this.alert.simpleErrorAlert('No se ha agregado ningun producto a la factura');
      return false;
    }
    listProductos.map(producto => {
      let detalleVenta = new DetalleVentaDTO();
      detalleVenta.cantidad = producto.cantidad;
      detalleVenta.codigoProducto = producto.codigo;
      detalleVenta.nombreformaVenta = producto.formaVenta;
      venta.agregarDetalle(detalleVenta);
    });

    return true;
  }

  /**
   * Este metodo se encarga de obtener las ventas de la base de datos
   * @returns un observable de tipo DetalleVentaDTO
   */
  public obtenerVentas(page: number): Observable<Page<VentaDTO>> {
    return this.httpVentaService.obtenerVentas(page);
  }

  /**
  * Removed localStorage usage - this method is no longer needed.
  * Data is now fetched directly from API when required.
  */

  /**
   * Este metodo se encarga de obtener el siguiente id de venta
   * @returns un observable de tipo number
   */
  public generarIdVenta(): Observable<number> {
    return this.httpVentaService.generaIdVenta();
  }
  /**
   * Este metodo se encarga de obtener una venta de la base de datos
   * dado un id
   * @param id 
   */
  public obtenerVenta(id: number): Observable<FullVentaDTO> {
    return this.httpVentaService.obtenerDetalleVenta(id);
  }

  /**
   * Este metodo se encarga de eliminar una venta de la base de datos
   * En la base de datos se cambia el estado de la venta a cancelada
   * @param idVenta 
   * @returns 
   */
  public eliminarVenta(idVenta: number): Observable<boolean> {
    return new Observable<boolean>((observer) => {
      this.httpVentaService.cancelarVenta(idVenta).subscribe({
        next: () => {
          this.alert.simpleSuccessAlert('Venta eliminada correctamente');
          observer.next(true); // Emitir un valor verdadero
          observer.complete(); // Completar el observable
        },
        error: (error) => {
          this.alert.simpleErrorAlert(error.error.mensaje);
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  preguntarEliminarVenta() {
    return this.alert.confirmAlert('¿Está seguro que desea eliminar la venta?', 'Esta acción no se puede deshacer');
  }

  mostrarErrorTotalNegativo() {
    this.alert.simpleErrorAlert('El total de la venta no puede ser negativo');
  }

  crearEFactura(efactura: CrearEFacturaDTO) {
    this.httpVentaService.crearFacturaElectronica(efactura).subscribe({
      next: () => {
        this.alert.simpleSuccessAlert('Se ha guardado el intento de generar una factura eléctrónica. Debe continuar con el proceso en la nueva ventana.');
      },
      error: (error) => {
        this.alert.simpleErrorAlert(error.error.mensaje);
      }
    });
  }

  obtenerFacturasElectronicas(page: number): Observable<Page<EFacturaDTO>> {
    return this.httpVentaService.obtenerEFacturas(page);
  }

  /**
   * Obtiene el total de ventas para una fecha específica
   * @param fecha Fecha en formato YYYY-MM-DD
   * @returns Observable con el total de ventas
   */
  public obtenerTotalVentasPorFecha(fecha: string): Observable<number> {
    return this.httpVentaService.obtenerTotalVentasPorFecha(fecha).pipe(
      catchError((error) => {
        console.error('Error al obtener total de ventas:', error);
        this.alert.simpleErrorAlert('Error al cargar el total de ventas');
        return of(0);
      })
    );
  }
}