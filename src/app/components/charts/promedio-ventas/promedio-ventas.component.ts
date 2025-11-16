import { Component, Input } from '@angular/core';

@Component({
  selector: 'chart-promedio-ventas',
  templateUrl: './promedio-ventas.component.html',
  styleUrl: './promedio-ventas.component.css'
})
export class PromedioVentasComponent {
  @Input() promedioVenta: number = 0;

  /**
   * Formatea un número como moneda
   */
  formatearMoneda(valor: number): string {
    return valor.toLocaleString('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 });
  }
}
