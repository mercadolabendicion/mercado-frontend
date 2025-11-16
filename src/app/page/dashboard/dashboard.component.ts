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

    console.log('Datos procesados para los charts:', {
      totalIngresos: this.totalIngresos,
      totalVentas: this.totalVentas,
      promedioVenta: this.promedioVenta,
      ventasPorDia: this.ventasPorDia
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
