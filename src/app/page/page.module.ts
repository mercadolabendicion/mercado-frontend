import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageRoutingModule } from './page-routing.module';
import { CajaComponent } from './caja/caja.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { MenuComponent } from '../components/menu/menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IngresosByVentasComponent } from '../components/charts/ingresos-by-ventas/ingresos-by-ventas.component';
import { VentasHoyComponent } from '../components/charts/ventas-hoy/ventas-hoy.component';
import { TotalCajaMenorComponent } from '../components/charts/total-caja-menor/total-caja-menor.component';
import { DiaMasVentasComponent } from '../components/charts/dia-mas-ventas/dia-mas-ventas.component';
import { DiaMasIngresosComponent } from '../components/charts/dia-mas-ingresos/dia-mas-ingresos.component';
import { PromedioVentasComponent } from '../components/charts/promedio-ventas/promedio-ventas.component';
import { ProductoMasVendidoComponent } from '../components/charts/producto-mas-vendido/producto-mas-vendido.component';
import { ListaMasVendidosComponent } from '../components/charts/lista-mas-vendidos/lista-mas-vendidos.component';
import { ProductosStockMinimoComponent } from '../components/charts/productos-stock-minimo/productos-stock-minimo.component';
import { ProductosProximosVencerComponent } from '../components/charts/productos-proximos-vencer/productos-proximos-vencer.component';

@NgModule({
  declarations: [
    DashboardComponent,
    IngresosByVentasComponent,
    VentasHoyComponent,
    TotalCajaMenorComponent,
    DiaMasVentasComponent,
    DiaMasIngresosComponent,
    PromedioVentasComponent,
    ProductoMasVendidoComponent,
    ListaMasVendidosComponent,
    ProductosStockMinimoComponent,
    ProductosProximosVencerComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule
  ],
  exports: [
    DashboardComponent,
  ]
})
export class PageModule { }
