import { Component, Input } from '@angular/core';

interface Producto {
  id: number;
  nombre: string;
  cantidad: number;
  ingresos: number;
}

@Component({
  selector: 'chart-producto-mas-vendido',
  templateUrl: './producto-mas-vendido.component.html',
  styleUrl: './producto-mas-vendido.component.css'
})
export class ProductoMasVendidoComponent {
  @Input() productoMasVendido: Producto | null = null;

}
