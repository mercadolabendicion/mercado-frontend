import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
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
export class DiaMasIngresosComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer', { static: false })
  chartContainer!: ElementRef<HTMLDivElement>;

  private chart: IChartApi | null = null;
  private baselineSeries: any = null;
  private resizeObserver: ResizeObserver | null = null;

  private ventasPorDia: VentasDia[] = [
    {
      diaSemana: 'Domingo',
      numeroDia: 1,
      cantidadVentas: 5,
      totalVentas: 208520,
    },
    {
      diaSemana: 'Lunes',
      numeroDia: 2,
      cantidadVentas: 19,
      totalVentas: 52527,
    },
    {
      diaSemana: 'Martes',
      numeroDia: 3,
      cantidadVentas: 127,
      totalVentas: 740510.4,
    },
    {
      diaSemana: 'Miércoles',
      numeroDia: 4,
      cantidadVentas: 42,
      totalVentas: 230528.5,
    },
    {
      diaSemana: 'Jueves',
      numeroDia: 5,
      cantidadVentas: 2,
      totalVentas: 3458,
    },
    {
      diaSemana: 'Viernes',
      numeroDia: 6,
      cantidadVentas: 1,
      totalVentas: 4000,
    },
    {
      diaSemana: 'Sábado',
      numeroDia: 7,
      cantidadVentas: 4,
      totalVentas: 36012,
    },
  ];

  ngAfterViewInit(): void {
    this.initializeChart();
    this.setupResizeObserver();
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
      }
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

    // Mapear los datos `ventasPorDia` a items horizontales (numeroDia)
    // Usamos `numeroDia` como 'time' y `totalVentas` como value (tambien se puede usar cantidadVentas de ser necesario)
    const seriesData = this.ventasPorDia.map((d) => ({ time: d.numeroDia, value: d.totalVentas }));
    this.baselineSeries.setData(seriesData as any);
    this.chart.timeScale().fitContent();
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
