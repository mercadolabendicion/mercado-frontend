/**
 * Estructura de respuesta del endpoint GET /dashboard/estadisticas
 * Agrupa todas las estadísticas del dashboard
 */
export interface ResumenVenta {
    totalIngresos: number;
    totalVentas: number;
    promedioVenta: number;
}

export interface VentaPorDia {
    diaSemana: string;
    numeroDia: number;
    cantidadVentas: number;
    totalVentas: number;
}

export interface DashboardEstadisticasDTO {
    // Resumen de ventas con ingresos, cantidad de ventas y promedio
    resumenVentas?: ResumenVenta;

    // Ventas por día de la semana (7 elementos, índice 0 = domingo, 6 = sábado)
    ventasPorDia?: VentaPorDia[];

    // Caja menor
    cajaMenor?: {
        saldo: number;
        entrada: number;
        salida: number;
    };

    // Día con más ventas
    diaConMasVentas?: {
        diaSemana: string;
        fecha: string;
        cantidad: number;
    };

    // Producto más vendido
    productoMasVendido?: {
        id: number;
        nombre: string;
        cantidad: number;
        ingresos: number;
    };

    // Lista de productos más vendidos
    listaMasVendidos?: {
        id: number;
        nombre: string;
        cantidad: number;
        ingresos: number;
    }[];

    // Productos próximos a vencer
    productosProximosVencer?: {
        id: number;
        nombre: string;
        fechaVencimiento: string;
        cantidad: number;
    }[];

    // Información de período consultado
    periodo?: {
        fechaInicio: string;
        fechaFin: string;
    };
}
