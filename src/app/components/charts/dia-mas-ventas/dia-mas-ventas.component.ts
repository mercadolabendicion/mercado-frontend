import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

interface VentaPorDia {
  diaSemana: string;
  numeroDia: number;
  cantidadVentas: number;
  totalVentas: number;
}

@Component({
  selector: 'chart-dia-mas-ventas',
  templateUrl: './dia-mas-ventas.component.html',
  styleUrl: './dia-mas-ventas.component.css'
})
export class DiaMasVentasComponent implements OnChanges {
  @Input() ventasPorDia: VentaPorDia[] = [];

  diaMasVentas: VentaPorDia | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['ventasPorDia'] && this.ventasPorDia.length > 0) {
      this.identificarDiaConMasVentas();
    }
  }

  /**
   * Identifica el día con más ventas ordenando el array por cantidadVentas de mayor a menor
   */
  private identificarDiaConMasVentas(): void {
    if (!this.ventasPorDia || this.ventasPorDia.length === 0) {
      this.diaMasVentas = null;
      return;
    }

    // Ordenar por cantidadVentas de mayor a menor y tomar el primero
    const diaMaximo = [...this.ventasPorDia].sort(
      (a, b) => b.cantidadVentas - a.cantidadVentas
    )[0];

    this.diaMasVentas = diaMaximo;
    console.log('Día con más ventas identificado:', this.diaMasVentas);
  }
}
