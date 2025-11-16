import { Component, Input } from '@angular/core';

@Component({
  selector: 'chart-ingresos-by-ventas',
  templateUrl: './ingresos-by-ventas.component.html',
  styleUrl: './ingresos-by-ventas.component.css'
})
export class IngresosByVentasComponent {
  @Input() totalIngresos: number = 0;
  @Input() totalVentas: number = 0;

  /**
   * Formatea un número como moneda
   */
  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }
}