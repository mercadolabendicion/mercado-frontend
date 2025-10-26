import { Component, inject } from '@angular/core';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { VentaDTO } from 'src/app/dto/venta/VentaDTO';
import { ReporteDTO } from 'src/app/dto/reporte/ReporteDTO';
import { CajaService } from 'src/app/services/domainServices/caja.service';
import Swal from 'sweetalert2';
import { ReporteService } from 'src/app/services/domainServices/reporte.service';
import { MovimientoService } from 'src/app/services/domainServices/movimiento.service';
import { MovimientoResponseDTO } from 'src/app/dto/movimiento/MovimientoResponseDTO';
import { VentaService } from 'src/app/services/domainServices/venta.service';
import { CajaMenorService } from 'src/app/services/domainServices/cajaMenor.service';
import { CajaMayorService } from 'src/app/services/domainServices/cajaMayor.service';
import { HistorialCajaMenorDTO } from 'src/app/dto/caja/HistorialCajaMenorDTO';
import { HistorialCajaMayorDTO } from 'src/app/dto/caja/HistorialCajaMayorDTO';

@Component({
  selector: 'app-caja',
  templateUrl: './caja.component.html',
  styleUrls: ['./caja.component.css']
})
export class CajaComponent {
  ingresos: number = 0;
  egresos: number = 0;
  saldo: number = 0;
  totalVentas: number = 0;

  // Historial caja menor
  registrosCajaMenor: HistorialCajaMenorDTO[] = [];
  paginaActualMenor: number = 0;
  tamanioPaginaMenor: number = 15;
  tieneMasRegistrosMenor: boolean = true;

  // Historial caja mayor
  registrosCajaMayor: HistorialCajaMayorDTO[] = [];
  paginaActualMayor: number = 0;
  tamanioPaginaMayor: number = 15;
  tieneMasRegistrosMayor: boolean = true;

  // Campos del modal
  valorCierreCajaMayor: number = 0;
  valorCierreFormateado: string = '';

  protected ventas: VentaDTO[];
  private reporteService: ReporteService = inject(ReporteService);
  private cajaService: CajaService = inject(CajaService);
  private movimientoService: MovimientoService = inject(MovimientoService);
  private ventaService: VentaService = inject(VentaService);
  private cajaMenorService: CajaMenorService = inject(CajaMenorService);
  private cajaMayorService: CajaMayorService = inject(CajaMayorService);

  constructor(private menuComponent: MenuComponent) {
    this.ventas = [];
  }

  triggerToggleCollapse() {
    if (!this.menuComponent.estadoMenu) {
      this.menuComponent.toggleCollapse();
    }
  }

  async ngOnInit() {
    await this.cargarDatos();
    this.cargarHistorialCajaMenor();
    this.cargarHistorialCajaMayor();
    this.cargarSaldoActual();
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   */
  obtenerFechaActual(): string {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  /**
   * Carga los movimientos del día y calcula ingresos y egresos
   */
  async cargarMovimientosDelDia(): Promise<void> {
    const fechaActual = this.obtenerFechaActual();

    return new Promise((resolve, reject) => {
      this.movimientoService.obtenerMovimientosPorFecha(fechaActual).subscribe({
        next: (movimientos: MovimientoResponseDTO[]) => {
          // Calcular total de ingresos de movimientos
          const ingresosMovimientos = movimientos
            .filter(mov => mov.tipo.toUpperCase() === 'INGRESO')
            .reduce((sum, mov) => sum + mov.valor, 0);

          // Calcular total de egresos
          this.egresos = movimientos
            .filter(mov => mov.tipo.toUpperCase() === 'EGRESO')
            .reduce((sum, mov) => sum + mov.valor, 0);

          // Obtener total de ventas del día
          this.ventaService.obtenerTotalVentasPorFecha(fechaActual).subscribe({
            next: (totalVentas) => {
              this.totalVentas = totalVentas;

              // Sumar ingresos de movimientos + ventas del día
              this.ingresos = ingresosMovimientos + totalVentas;

              console.log('Datos del día cargados:', {
                movimientos: movimientos.length,
                ingresosMovimientos: ingresosMovimientos,
                totalVentas: totalVentas,
                ingresosTotal: this.ingresos,
                egresos: this.egresos
              });

              resolve();
            },
            error: (err) => {
              console.error('Error al cargar ventas del día:', err);
              // Si falla, solo usar los ingresos de movimientos
              this.totalVentas = 0;
              this.ingresos = ingresosMovimientos;
              resolve();
            }
          });
        },
        error: (err) => {
          console.error('Error al cargar movimientos del día:', err);
          this.ingresos = 0;
          this.egresos = 0;
          this.totalVentas = 0;
          reject(err);
        }
      });
    });
  }

  /**
   * Carga el historial de cierres de caja menor desde el backend
   */
  cargarHistorialCajaMenor() {
    this.cajaMenorService.obtenerHistorial(this.paginaActualMenor, this.tamanioPaginaMenor).subscribe({
      next: (historial) => {
        this.registrosCajaMenor = historial;
        this.tieneMasRegistrosMenor = historial.length === this.tamanioPaginaMenor;
      },
      error: (err) => {
        console.error('Error al cargar historial de caja menor:', err);
      }
    });
  }

  /**
   * Carga el historial de cierres de caja mayor desde el backend
   */
  cargarHistorialCajaMayor() {
    this.cajaMayorService.obtenerHistorial(this.paginaActualMayor, this.tamanioPaginaMayor).subscribe({
      next: (historial) => {
        this.registrosCajaMayor = historial;
        this.tieneMasRegistrosMayor = historial.length === this.tamanioPaginaMayor;
      },
      error: (err) => {
        console.error('Error al cargar historial de caja mayor:', err);
      }
    });
  }

  /**
   * Carga el saldo actual desde el backend (caja mayor)
   */
  cargarSaldoActual() {
    this.cajaMayorService.obtenerEstado().subscribe({
      next: (estado) => {
        if (estado) {
          this.saldo = estado.saldo;
        }
      },
      error: (err) => {
        console.error('Error al cargar saldo de caja mayor:', err);
      }
    });
  }

  /**
   * Formatea la fecha para mostrarla de forma legible
   */
  formatearFecha(fechaISO: string): string {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    const horas = String(fecha.getHours()).padStart(2, '0');
    const minutos = String(fecha.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  /**
   * Navega a la página anterior de caja menor
   */
  paginaAnteriorMenor() {
    if (this.paginaActualMenor > 0) {
      this.paginaActualMenor--;
      this.cargarHistorialCajaMenor();
    }
  }

  /**
   * Navega a la página siguiente de caja menor
   */
  paginaSiguienteMenor() {
    if (this.tieneMasRegistrosMenor) {
      this.paginaActualMenor++;
      this.cargarHistorialCajaMenor();
    }
  }

  /**
   * Navega a la página anterior de caja mayor
   */
  paginaAnteriorMayor() {
    if (this.paginaActualMayor > 0) {
      this.paginaActualMayor--;
      this.cargarHistorialCajaMayor();
    }
  }

  /**
   * Navega a la página siguiente de caja mayor
   */
  paginaSiguienteMayor() {
    if (this.tieneMasRegistrosMayor) {
      this.paginaActualMayor++;
      this.cargarHistorialCajaMayor();
    }
  }

  mostrarModalCerrarCaja() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }

    // Limpiar el valor del cierre
    this.valorCierreCajaMayor = 0;

    const modal = document.getElementById('cerrarCajaModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  mostrarModalEgreso() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    const modal = document.getElementById('egresoModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  ocultarModal(modalId: string) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.style.display = 'none';
    }
  }

  obtenerFechaHoraActual(): string {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
  }

  cerrarCaja() {
    // Validar que el valor sea mayor a 0
    if (this.valorCierreCajaMayor <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un valor válido para cerrar la caja'
      });
      return;
    }

    // Usar el servicio de caja mayor
    this.cajaMayorService.cerrarCaja(this.valorCierreCajaMayor).subscribe({
      next: (success) => {
        if (success) {
          this.ocultarModal('cerrarCajaModal');

          // La alerta ya la muestra el servicio, solo recargamos
          setTimeout(() => {
            this.ngOnInit();
          }, 2000);
        }
      },
      error: (err) => {
        console.error('Error al cerrar caja mayor:', err);
      }
    });
  }

  registrarEgreso() {
    const valorInput = (<HTMLInputElement>document.getElementById('valorEgreso')).value;
    const motivoInput = (<HTMLTextAreaElement>document.getElementById('motivoEgreso')).value;

    const valorNumerico = parseFloat(valorInput.replace(/,/g, ''));

    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      this.egresos += valorNumerico;
      this.ocultarModal('egresoModal');

      // Limpiar campos
      (<HTMLInputElement>document.getElementById('valorEgreso')).value = '';
      (<HTMLTextAreaElement>document.getElementById('motivoEgreso')).value = '';

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Egreso registrado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un valor válido'
      });
    }
  }

  formatearValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, '');
    const valorNumerico = parseInt(valorSinFormato, 10);

    if (!isNaN(valorNumerico)) {
      input.value = valorNumerico.toLocaleString('en-US');
    } else {
      input.value = '';
    }
  }

  async cargarDatos() {
    // Cargar movimientos del día desde el backend
    await this.cargarMovimientosDelDia();
  }

  protected generarReporte() {
    // Implementar generación de reporte con los registros de caja
    console.log('Generar reporte', this.registrosCajaMenor);
  }

formatearValorCierre(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, '');

    if (valorSinFormato === '') {
      this.valorCierreFormateado = '';
      this.valorCierreCajaMayor = 0;
      input.value = '';
      return;
    }

    const valorNumerico = parseInt(valorSinFormato, 10);

    if (!isNaN(valorNumerico)) {
      this.valorCierreFormateado = valorNumerico.toLocaleString('en-US');
      this.valorCierreCajaMayor = valorNumerico; // Guardar el valor numérico
      input.value = this.valorCierreFormateado;
    } else {
      this.valorCierreFormateado = '';
      this.valorCierreCajaMayor = 0;
      input.value = '';
    }
  }
}