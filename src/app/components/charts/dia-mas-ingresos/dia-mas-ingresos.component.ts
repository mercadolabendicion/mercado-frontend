import {
  Component,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  Input,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { createChartEx, BaselineSeries, IChartApi } from 'lightweight-charts';
import { HorzScaleBehaviorWeek } from './horz-scale-week';

interface VentaPorDia {
  diaSemana: string;
  numeroDia: number;
  cantidadVentas: number;
  totalVentas: number;
}

@Component({
  selector: 'chart-dia-mas-ingresos',
  templateUrl: './dia-mas-ingresos.component.html',
  styleUrl: './dia-mas-ingresos.component.css',
})
export class DiaMasIngresosComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChild('chartContainer', { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  @Input() ventasPorDia: VentaPorDia[] = [];

  diaMasVentas: VentaPorDia | null = null;
  private chart: IChartApi | null = null;
  private baselineSeries: any = null;
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    this.initializeChart();
    this.setupResizeObserver();
  }

  /**
   * Se ejecuta cuando los @Input cambian
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ventasPorDia'] && this.chart && this.baselineSeries) {
      this.updateChartData();
    }
    if (changes['ventasPorDia'] && this.ventasPorDia.length > 0) {
      this.identificarDiaConMasVentas();
    }
  }

  private initializeChart(): void {
    if (!this.chartContainer) return;

    const horzBehaviour = new HorzScaleBehaviorWeek();
    const container = this.chartContainer.nativeElement;
    const width = container.clientWidth;
    const height = 300;
    this.chart = createChartEx(
      container,
      horzBehaviour as unknown as import('lightweight-charts').IHorzScaleBehavior<unknown>,
      {
        width,
        height,
        layout: {
          background: { color: '#fff' },
          textColor: '#000',
        },
        // Ocultar la marca de agua (por defecto la librería puede mostrarla)
        watermark: { visible: false },
      } as any
    );

    this.baselineSeries = this.chart.addSeries(BaselineSeries, {
      baseValue: { type: 'price', price: 50 },
      topLineColor: 'rgba(38, 166, 154, 0.8)',
      topFillColor1: 'rgba(38, 166, 154, 0.28)',
      topFillColor2: 'rgba(38, 166, 154, 0.05)',
      bottomLineColor: 'rgba(239, 83, 80, 0.8)',
      bottomFillColor1: 'rgba(239, 83, 80, 0.05)',
      bottomFillColor2: 'rgba(239, 83, 80, 0.28)',
    });

    this.updateChartData();
  }

  /**
   * Actualiza los datos del gráfico
   */
  private updateChartData(): void {
    if (!this.baselineSeries || this.ventasPorDia.length === 0) return;

    // Mapear los datos `ventasPorDia` a items del gráfico
    // Usamos `numeroDia` como 'time' y `totalVentas` como value
    const seriesData = this.ventasPorDia.map((d) => ({
      time: d.numeroDia,
      value: d.totalVentas,
    }));

    this.baselineSeries.setData(seriesData as any);
    this.chart?.timeScale().fitContent();
  }

  private getContainerDimensions(container: HTMLDivElement): {
    width: number;
    height: number;
  } {
    return {
      width: container.clientWidth || 400,
      height: 300,
    };
  }

  private setupResizeObserver(): void {
    if (!this.chartContainer?.nativeElement || !this.chart) {
      return;
    }

    this.resizeObserver = new ResizeObserver(() => {
      const container = this.chartContainer.nativeElement;
      const { width, height } = this.getContainerDimensions(container);
      this.chart?.applyOptions({ width, height });
    });

    this.resizeObserver.observe(this.chartContainer.nativeElement);
  }

  /**
   * Identifica el día con más ventas ordenando el array por totalVentas de mayor a menor
   */
  private identificarDiaConMasVentas(): void {
    if (!this.ventasPorDia || this.ventasPorDia.length === 0) {
      this.diaMasVentas = null;
      return;
    }

    // Ordenar por totalVentas de mayor a menor y tomar el primero
    const diaMaximo = [...this.ventasPorDia].sort(
      (a, b) => b.totalVentas - a.totalVentas
    )[0];

    this.diaMasVentas = diaMaximo;
  }

  /**
   * Formatea un número como moneda en formato COP (Colombia)
   * @param valor Valor numérico a formatear
   * @returns Valor formateado como moneda
   */
  formatearMoneda(valor: number): string {
    if (!valor) {
      return '$ 0';
    }
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
