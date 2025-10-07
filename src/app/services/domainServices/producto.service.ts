import { inject, Injectable } from "@angular/core";
import { HttpProductoService } from "../http-services/httpProductos.service";
import { catchError, map, Observable, of, tap } from "rxjs";
import { AlertService } from "src/app/utils/alert.service";
import { ProductoDTO } from "src/app/dto/producto/ProductoDTO";
import { ActualizarProductoDTO } from "src/app/dto/producto/ActualizarProductoDTO";
import { CrearProductoDTO } from "src/app/dto/producto/CrearProductoDTO";
import { Page } from "src/app/dto/pageable/Page";
import { ProductoCompletoDTO } from "src/app/dto/producto/ProductoCompletoDTO";
import { FormaVenta } from "src/app/dto/formasVenta/FormaVenta";
import { ActualizarFormaVentaCompletoDTO } from "src/app/dto/producto/ActualizarFormaVentaCompletoDTO";
import { GuardarFormaVenta } from "src/app/dto/formasVenta/GuardarFormaVenta";

@Injectable({
    providedIn: 'root'
})
export class ProductoService {


    private httpProductoService: HttpProductoService = inject(HttpProductoService);
    private alert: AlertService = inject(AlertService);

    /**
     * Este método se encarga de obtener los productos de la base de datos
     * @returns un observable de tipo ProductoDTO
     */
    public getProductos(page: number): Observable<Page<ProductoDTO>> {
        return this.httpProductoService.getProductos(page);
    }

    /**
    * Este método se encarga de obtener los productos de la base de datos
    */
    public getTodosProductos() {
        this.httpProductoService.getTodosLosProductos().subscribe({
            next: (resp) => {
                localStorage.setItem('productos', JSON.stringify(resp));
                console.log('Productos totales cargados:', resp.length);
            },
        });
    }

    /**
    * Este metodo obtiene los productos del LocalStorage
    * devuelve una lista de ProductoDTO
    */
    obtenerProductoLocal(): ProductoDTO[] {
        const productos = localStorage.getItem('productos');

        if (!productos) {
            // Si no hay productos almacenados, devuelve un arreglo vacío
            return [];
        }
        // Si hay productos, intenta parsearlos
        try {
            return JSON.parse(productos);
        } catch (error) {
            console.error(
                'Error al parsear los productos desde localStorage:',
                error
            );
            return []; // Devuelve un arreglo vacío si hay un error de formato
        }
    }

    /**
     * Este método se encarga de verificar si un producto está activo
     * @param codigo es el código del producto a verificar
     * @returns un booleano que indica si el producto está activo
     */
    public verificarProductoEliminado(codigo: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            this.httpProductoService.fueEliminado(codigo).subscribe({
                next: (response) => {
                    if (response) this.alert.simpleErrorAlert('El producto fue eliminado');
                    resolve(response);
                },
                error: (error) => {
                    this.alert.simpleErrorAlert('Error al verificar si el producto esta eliminado');
                    reject(false);
                }
            });
        });
    }

    /**
 * Este método se encarga de verificar si hay cambios
 * respecto a lo que sw tenía en la base de datos
 */
    public verificarCambios() {
        if (this.httpProductoService.verificarCambios()) {
            return true;
        }
        return false;
    }

    /**
     * Este método se encarga de verificar si un producto tiene suficiente cantidad
     * @param cantidad Cantidad de producto a verificar
     * @param codigo Código del producto a verificar
     * @returns un booleano que indica si el producto tiene suficiente cantidad
     */
    public verificarProductoCantidad(cantidad: number, codigo: string, formaVenta: string): Promise<boolean> {
        console.log(`Verificando cantidad: ${cantidad} para producto: ${codigo} con forma de venta: ${formaVenta}`);
        return new Promise((resolve, reject) => {
            this.httpProductoService.verificarCantidad(cantidad, codigo, formaVenta).subscribe({
                next: (response) => {
                    if (!response) this.alert.simpleErrorAlert('No hay suficiente cantidad de producto');
                    resolve(response);
                },
                error: (error) => {
                    this.alert.simpleErrorAlert('Error al verificar cantidad del producto');
                    reject(error);
                }
            });
        });
    }

    /**
     * Este metodo se encarga de eliminar un producto por su id, muestra un mensaje de confirmación antes de eliminar
     * @param id es el id del producto a eliminar
     * @returns un booleano que indica si el producto fue eliminado
     */

    public eliminarProductoCodigo(codigo: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.httpProductoService.eliminarPorCodigo(codigo).subscribe({
                next: () => {
                    this.alert.simpleSuccessAlert("Producto eliminado correctamente");
                    resolve();
                },
                error: (error) => {
                    this.alert.simpleErrorAlert(error.error.mensaje);
                    reject(error);
                },
            });
        });
    }

    /**
     * Metodo para actualizar un producto en la base de datos
     * @param productoActualizar contiene los datos del producto a actualizar
     */
    public actualizar(productoActualizar: ActualizarProductoDTO): Observable<void> {
        return new Observable((observer) => {
            this.httpProductoService.actualizar(productoActualizar).subscribe({
                next: () => {
                    this.alert.simpleSuccessAlert('Producto actualizado correctamente');
                },
                error: (error) => {
                    this.alert.simpleErrorAlert(error.error.mensaje);
                }
            });
        });
    }

    /**
     * Este método se encarga de guardar un producto en la base de datos
     * @param producto es el producto a guardar
     */
    public guardarProducto(producto: CrearProductoDTO): Observable<boolean> {
        return this.httpProductoService.enviarDatos(producto).pipe(
            tap(() => this.alert.simpleSuccessAlert('Producto guardado correctamente')),
            map(() => true),
            catchError((error) => {
                this.alert.simpleErrorAlert(error.error.mensaje);
                return of(false); // Retorna un Observable con `false`
            })
        );
    }

    /**
     * Este método obtiene los tipos de impuesto de la base de datos
     * @returns 
     */
    public getTipoImpuesto(): Observable<string[]> {
        return this.httpProductoService.getTipoImpuesto();
    }

    /**
     * Este método se encarga de verificar si un producto existe
     * y si fue eliminado anteriormente
     * @param codigo 
     * @returns 
     */
    public fueEliminado(codigo: string): Observable<boolean> {
        return this.httpProductoService.fueEliminado(codigo);
    }

    /**
     * Este método se encarga de recuperar un producto eliminado
     * @param codigo 
     */
    public recuperarProducto(codigo: string): Observable<boolean> {
        return this.httpProductoService.recuperarProducto(codigo);
    }

    /**
     * Este método se encarga de obtener un producto por su código
     * @param idProducto 
     */
    obtenerProductoPorCodigo(idProducto: string) {
        return this.httpProductoService.obtenerProductoPorCodigo(idProducto);
    }

    obtenerProductoCompleto(codigo: string): Observable<ProductoCompletoDTO> {
        return this.httpProductoService.obtenerProductoCompleto(codigo);
    }

    obtenerFormasVentaByCodigo(codigo: string): Observable<FormaVenta[]> {
        return this.httpProductoService.obtenerFormasVentaByCodigo(codigo);
    }

    actualizarFormaVenta(formaVenta: ActualizarFormaVentaCompletoDTO): Observable<void> {
        return this.httpProductoService.actualizarFormaVenta(formaVenta);
    }

    eliminarFormaVenta(codigo: string, nombreForma: string) {
        this.httpProductoService.eliminarFormaVenta(codigo, nombreForma).subscribe({
            next: () => {
                this.alert.simpleSuccessAlert('Forma de venta eliminada correctamente');
            },
            error: (error) => {
                this.alert.simpleErrorAlert(error.error.mensaje);
            }
        });
    }

    guardarFormaVenta(guardarFormaVenta: GuardarFormaVenta) {
        this.httpProductoService.guardarFormaVenta(guardarFormaVenta).subscribe({
            next: () => {
                this.alert.simpleSuccessAlert('Forma de venta guardada correctamente');
            },
            error: (error) => {
                this.alert.simpleErrorAlert(error.error.mensaje);
            }
        });
    }

}