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

interface RegistroCaja {
  fechaHora: string;
  totalEgresos: number;
  totalIngresos: number;
  saldoAnterior: number;
  nuevoSaldo: number;
}

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
  registrosCaja: RegistroCaja[] = [];
  
  // Campos del modal
  fechaHoraModal: string = '';
  totalEgresosModal: number = 0;
  totalIngresosModal: number = 0;
  saldoAnteriorModal: number = 0;
  nuevoSaldoModal: number = 0;

  protected ventas: VentaDTO[];
  private reporteService: ReporteService = inject(ReporteService);
  private cajaService: CajaService = inject(CajaService);
  private movimientoService: MovimientoService = inject(MovimientoService);
  private ventaService: VentaService = inject(VentaService);

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

  mostrarModalCerrarCaja() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    
    // Cargar datos actuales
    this.fechaHoraModal = this.obtenerFechaHoraActual();
    this.totalEgresosModal = this.egresos;
    this.totalIngresosModal = this.ingresos;
    this.saldoAnteriorModal = this.saldo;
    this.nuevoSaldoModal = this.calcularNuevoSaldo();
    
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

  calcularNuevoSaldo(): number {
    return this.saldoAnteriorModal + this.totalIngresosModal - this.totalEgresosModal;
  }

  onCampoModalChange() {
    // Recalcular el nuevo saldo cuando cambien los campos
    this.nuevoSaldoModal = this.saldoAnteriorModal + this.totalIngresosModal - this.totalEgresosModal;
  }

  cerrarCaja() {
    const nuevoRegistro: RegistroCaja = {
      fechaHora: this.fechaHoraModal,
      totalEgresos: this.totalEgresosModal,
      totalIngresos: this.totalIngresosModal,
      saldoAnterior: this.saldoAnteriorModal,
      nuevoSaldo: this.nuevoSaldoModal
    };

    // Agregar el nuevo registro al inicio del array
    this.registrosCaja.unshift(nuevoRegistro);
    
    // Actualizar el saldo actual con el nuevo saldo
    this.saldo = this.nuevoSaldoModal;
    
    // Resetear ingresos y egresos después del cierre
    this.ingresos = 0;
    this.egresos = 0;
    
    // Limpiar también las variables de ingresos y egresos de localStorage
    localStorage.setItem('ingresos', '0');
    localStorage.setItem('egresos', '0');
    
    this.guardarDatos();
    this.ocultarModal('cerrarCajaModal');
    
    Swal.fire({
      icon: 'success',
      title: '¡Éxito!',
      text: 'Caja cerrada exitosamente',
      timer: 2000,
      showConfirmButton: false
    });
  }

  registrarEgreso() {
    const valorInput = (<HTMLInputElement>document.getElementById('valorEgreso')).value;
    const motivoInput = (<HTMLTextAreaElement>document.getElementById('motivoEgreso')).value;
    
    const valorNumerico = parseFloat(valorInput.replace(/,/g, ''));
    
    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      this.egresos += valorNumerico;
      this.guardarDatos();
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

  guardarDatos() {
    localStorage.setItem('ingresos', this.ingresos.toString());
    localStorage.setItem('egresos', this.egresos.toString());
    localStorage.setItem('saldo', this.saldo.toString());
    localStorage.setItem('caja', JSON.stringify(this.registrosCaja));
  }

  async cargarDatos() {
    // Cargar movimientos del día desde el backend
    await this.cargarMovimientosDelDia();
    
    // Cargar saldo y registros desde localStorage
    this.saldo = parseFloat(localStorage.getItem('saldo') || '0');
    this.registrosCaja = JSON.parse(localStorage.getItem('caja') || '[]');
    
    // Ya no cargamos ingresos y egresos del localStorage
    // porque ahora vienen del backend
  }

  limpiarDatos() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    
    Swal.fire({
      title: '¿Está seguro?',
      text: 'Se eliminarán todos los registros de caja',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('ingresos');
        localStorage.removeItem('egresos');
        localStorage.removeItem('saldo');
        localStorage.removeItem('caja');
        
        this.ingresos = 0;
        this.egresos = 0;
        this.saldo = 0;
        this.registrosCaja = [];
        
        Swal.fire({
          icon: 'success',
          title: '¡Limpiado!',
          text: 'Datos limpiados exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  protected generarReporte() {
    // Implementar generación de reporte con los registros de caja
    console.log('Generar reporte', this.registrosCaja);
  }
}