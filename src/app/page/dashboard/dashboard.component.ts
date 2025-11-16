import { Component, OnInit, inject } from '@angular/core';
import { DashboardService } from '../../services/domainServices/dashboard.service';
import { DashboardEstadisticasDTO, VentaPorDia } from '../../dto/dashboard/DashboardEstadisticasDTO';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {

  private dashboardService: DashboardService = inject(DashboardService);
  estadisticas: DashboardEstadisticasDTO | null = null;

  // Datos para los charts
  totalIngresos: number = 0;
  totalVentas: number = 0;
  promedioVenta: number = 0;
  ventasPorDia: VentaPorDia[] = [];
  productoMasVendido: any = null;
  productosMasVendidos: any[] = [];
  productosProximosVencer: any[] = [];

  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  /**
   * Carga las estadísticas del dashboard para el período actual
   * Usa fechas por defecto: últimos 30 días
   */
  private cargarEstadisticas(): void {
    const hoy = new Date();
    const hace30Dias = new Date(hoy.getTime() - 30 * 24 * 60 * 60 * 1000);
    const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);

    const fechaFin = this.formatearFecha(hoy);
    const fechaInicio = this.formatearFecha(hace7Dias);

    console.log(`Cargando estadísticas del dashboard desde ${fechaInicio} hasta ${fechaFin}`);

    this.dashboardService.obtenerEstadisticas(fechaInicio, fechaFin).subscribe({
      next: (datos) => {
        this.estadisticas = datos;
        this.procesarDatos(datos);
        console.log('Estadísticas del dashboard recibidas:', datos);
      },
      error: (error) => {
        console.error('Error al cargar estadísticas:', error);
      }
    });
  }

  /**
   * Procesa los datos recibidos del endpoint y los asigna a variables para los charts
   * @param datos Datos del dashboard
   */
  private procesarDatos(datos: DashboardEstadisticasDTO): void {
    
    if (datos.resumenVentas) {
      this.totalIngresos = datos.resumenVentas.totalIngresos || 0;
      this.totalVentas = datos.resumenVentas.totalVentas || 0;
      this.promedioVenta = datos.resumenVentas.promedioVenta || 0;
    }

    if (datos.ventasPorDia && Array.isArray(datos.ventasPorDia)) {
      this.ventasPorDia = datos.ventasPorDia;
    }

    if (datos.productosMasVendidos && Array.isArray(datos.productosMasVendidos) && datos.productosMasVendidos.length > 0) {
      this.productosMasVendidos = datos.productosMasVendidos;
      
      const firstGroup = datos.productosMasVendidos[0];
      let producto: any = null;

      if (Array.isArray(firstGroup)) {
        // Buscar un objeto dentro del sub-array
        producto = firstGroup.find((item: any) => item && typeof item === 'object' && ('nombre' in item || 'id' in item || 'cantidad' in item));

        // Si no hay objeto, intentar interpretar formatos comunes:
        // [id, nombre, cantidad] o [nombre, cantidad]
        if (!producto) {
          if (firstGroup.length >= 3 && typeof firstGroup[1] === 'string' && (typeof firstGroup[2] === 'number' || !isNaN(Number(firstGroup[2])))) {
            producto = { id: firstGroup[0], nombre: firstGroup[1], cantidad: Number(firstGroup[2]) };
          } else if (firstGroup.length >= 2) {
            producto = { nombre: String(firstGroup[0]), cantidad: Number(firstGroup[1]) };
          }
        }
      } else if (firstGroup && typeof firstGroup === 'object') {
        // Puede ser un objeto normal con claves específicas del backend
        // Ejemplo real: { codigoProducto, nombreProducto, cantidadVendida, totalVentas }
        const fg: any = firstGroup;

        // Intentar mapear campos comunes a nuestra forma estándar
        const nombre = fg.nombreProducto || fg.nombre || fg.producto || fg.nombre_producto || fg['0'] || null;
        const cantidad = (fg.cantidadVendida !== undefined && fg.cantidadVendida !== null) ? Number(fg.cantidadVendida)
          : (fg.cantidad !== undefined ? Number(fg.cantidad) : (fg.cantidadVentas !== undefined ? Number(fg.cantidadVentas) : null));
        const id = fg.codigoProducto || fg.id || fg.codigo || fg['0'] || null;
        const ingresos = (fg.totalVentas !== undefined ? Number(fg.totalVentas) : (fg.ingresos !== undefined ? Number(fg.ingresos) : null));

        if (nombre || cantidad !== null) {
          producto = {
            id: id,
            nombre: nombre || String(id || 'N/A'),
            cantidad: cantidad || 0,
            ingresos: ingresos || 0
          };
        } else {
          // Intentar tratar como array-like (claves numéricas)
          const keys = Object.keys(firstGroup);
          const numericKeys = keys.filter(k => /^\d+$/.test(k));
          if (numericKeys.length > 0) {
            const arrLike = numericKeys.sort((a, b) => Number(a) - Number(b)).map(k => firstGroup[k]);
            producto = arrLike.find((item: any) => item && typeof item === 'object' && ('nombre' in item || 'id' in item || 'cantidad' in item));
            if (!producto) {
              if (arrLike.length >= 3 && typeof arrLike[1] === 'string' && (typeof arrLike[2] === 'number' || !isNaN(Number(arrLike[2])))) {
                producto = { id: arrLike[0], nombre: arrLike[1], cantidad: Number(arrLike[2]) };
              } else if (arrLike.length >= 2) {
                producto = { nombre: String(arrLike[0]), cantidad: Number(arrLike[1]) };
              }
            }
          }
        }
      }

      if (producto) {
        this.productoMasVendido = producto;
      } else if (datos.productoMasVendido) {
        // Fallback al campo directo si existe
        this.productoMasVendido = datos.productoMasVendido;
      }
    } else if (datos.productoMasVendido) {
      // Si no existe 'productosMasVendidos', usar 'productoMasVendido' si el backend lo entrega
      this.productoMasVendido = datos.productoMasVendido;
    }

    if (datos.productosProximosVencer && Array.isArray(datos.productosProximosVencer)) {
      this.productosProximosVencer = datos.productosProximosVencer;
    }

    console.log('Datos procesados para los charts:', {
      totalIngresos: this.totalIngresos,
      totalVentas: this.totalVentas,
      promedioVenta: this.promedioVenta,
      ventasPorDia: this.ventasPorDia
      ,
      productoMasVendido: this.productoMasVendido
    });
  }

  /**
   * Formatea una fecha al formato YYYY-MM-DD requerido por el API
   * @param fecha Fecha a formatear
   * @returns Fecha formateada en formato YYYY-MM-DD
   */
  private formatearFecha(fecha: Date): string {
    const año = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const dia = String(fecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }
}
