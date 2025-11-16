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


@NgModule({
  declarations: [
    DashboardComponent,
    IngresosByVentasComponent,
    VentasHoyComponent,
    TotalCajaMenorComponent,
    DiaMasVentasComponent,
    DiaMasIngresosComponent,
    PromedioVentasComponent
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
