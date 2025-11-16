import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { createChartEx, BaselineSeries, IChartApi } from 'lightweight-charts';
import { HorzScaleBehaviorWeek } from './horz-scale-week';

interface VentasDia {
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
export class DiaMasIngresosComponent implements AfterViewInit, OnDestroy, OnChanges {
  @ViewChild('chartContainer', { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  @Input() ventasPorDia: VentasDia[] = [];

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
      ({
        width,
        height,
        layout: {
          background: { color: '#fff' },
          textColor: '#000',
        },
        // Ocultar la marca de agua (por defecto la librería puede mostrarla)
        watermark: { visible: false },
      } as any)
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

  private getContainerDimensions(container: HTMLDivElement): { width: number; height: number } {
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

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }
}
