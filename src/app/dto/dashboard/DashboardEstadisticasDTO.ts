/**
 * Estructura de respuesta del endpoint GET /dashboard/estadisticas
 * Agrupa todas las estadísticas del dashboard
 */
export interface DashboardEstadisticasDTO {
    // Ventas de hoy
    ventasHoy?: {
        cantidad: number;
        total: number;
        promedio: number;
    };

    // Ingresos por ventas (agregado)
    ingresosTotales?: {
        total: number;
        cantidad: number;
    };

    // Promedio de ventas
    promedioVentas?: {
        valor: number;
    };

    // Caja menor
    cajaMenor?: {
        saldo: number;
        entrada: number;
        salida: number;
    };

    // Día con más ingresos
    diaConMasIngresos?: {
        diaSemana: string;
        numeroDia: number;
        cantidadVentas: number;
        totalVentas: number;
    }[];

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
