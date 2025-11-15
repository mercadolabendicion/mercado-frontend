import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageRoutingModule } from './page-routing.module';
import { CajaComponent } from './caja/caja.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';
import { MenuComponent } from '../components/menu/menu.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { IngresosByVentasComponent } from '../components/charts/ingresos-by-ventas/ingresos-by-ventas.component';
import { VentasHoyComponent } from '../components/charts/ventas-hoy/ventas-hoy.component';


@NgModule({
  declarations: [
    DashboardComponent,
    IngresosByVentasComponent,
    VentasHoyComponent
  ],
  imports: [
    CommonModule,
    PageRoutingModule
  ],
  exports: [
    DashboardComponent,
    IngresosByVentasComponent,
    VentasHoyComponent
  ]
})
export class PageModule { }
