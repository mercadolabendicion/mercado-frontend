import { Component, inject } from '@angular/core';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { VentaDTO } from 'src/app/dto/venta/VentaDTO';
import { ReporteDTO } from 'src/app/dto/reporte/ReporteDTO';
import { CajaService } from 'src/app/services/domainServices/caja.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReporteService } from 'src/app/services/domainServices/reporte.service';
import { MovimientoService } from 'src/app/services/domainServices/movimiento.service';
import { MovimientoDTO } from 'src/app/dto/movimiento/MovimientoDTO';
import { MovimientoResponseDTO } from 'src/app/dto/movimiento/MovimientoResponseDTO';
import { CajaMenorService } from 'src/app/services/domainServices/cajaMenor.service';

interface Movimiento {
  id: string;
  motivo: string;
  valor: number;
  tipo: 'Ingreso' | 'Egreso';
  fecha: string;
  fechaHora: string;
}

@Component({
  selector: 'app-movimientos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './movimientos.component.html',
  styleUrls: ['./movimientos.component.css'],
})
export class MovimientosComponent {
  totalVentas: number = 0;
  saldoCajaMenor: number = 0;
  totalEfectivo: number = 0;
  ingresos: number = 0;
  egresos: number = 0;
  movimientos: Movimiento[] = [];
  movimientosFiltrados: Movimiento[] = [];
  modalTitle: string = '';
  actionButtonText: string = '';
  currentAction: 'ingreso' | 'egreso' | 'editar' = 'ingreso';
  protected ventas: VentaDTO[];
  private reporteService: ReporteService = inject(ReporteService);
  private movimientoService: MovimientoService = inject(MovimientoService);
  private cajaMenorService: CajaMenorService = inject(CajaMenorService);
  valorFormateado: string = '';
  private cajaService: CajaService = inject(CajaService);
  fechaFiltro: string = '';
  movimientoEnEdicion: Movimiento | null = null;

  // Variables para el resumen de cierre de caja
  totalVentasCierre: number = 0;
  totalEgresosCierre: number = 0;
  totalIngresosCierre: number = 0;
  valorCierreFormateado: string = '';

  constructor(private menuComponent: MenuComponent) {
    this.ventas = [];
  }

  formatearValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, '');

    if (valorSinFormato === '') {
      this.valorFormateado = '';
      input.value = '';
      return;
    }

    const valorNumerico = parseInt(valorSinFormato, 10);

    if (!isNaN(valorNumerico)) {
      this.valorFormateado = valorNumerico.toLocaleString('en-US');
      input.value = this.valorFormateado;
    } else {
      this.valorFormateado = '';
      input.value = '';
    }
  }

  formatearValorCierre(event: Event): void {
    const input = event.target as HTMLInputElement;
    const valorSinFormato = input.value.replace(/[^\d]/g, '');

    if (valorSinFormato === '') {
      this.valorCierreFormateado = '';
      input.value = '';
      return;
    }

    const valorNumerico = parseInt(valorSinFormato, 10);

    if (!isNaN(valorNumerico)) {
      this.valorCierreFormateado = valorNumerico.toLocaleString('en-US');
      input.value = this.valorCierreFormateado;
    } else {
      this.valorCierreFormateado = '';
      input.value = '';
    }
  }

  triggerToggleCollapse() {
    if (!this.menuComponent.estadoMenu) {
      this.menuComponent.toggleCollapse();
    }
  }

  async ngOnInit() {
    this.fechaFiltro = this.obtenerFechaActual();

    try {
      await this.obtenerVentas();
      this.totalVentas = this.sumarVentasDelDia(this.ventas);
      
      await this.cargarMovimientosPorFecha(this.fechaFiltro);
      
      // Consultar el saldo de caja menor desde el backend
      await this.consultarSaldoCajaMenor();
      
      this.actualizarTotalEfectivo();
    } catch (error) {
      console.error('Error durante la inicialización:', error);
    }
  }

  /**
   * Consulta el saldo de la caja menor desde el backend
   */
  consultarSaldoCajaMenor(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.cajaMenorService.consultarSaldo().subscribe({
        next: (saldo) => {
          this.saldoCajaMenor = saldo;
          console.log('Saldo de caja menor obtenido:', saldo);
          resolve();
        },
        error: (err) => {
          console.error('Error al consultar saldo de caja menor:', err);
          this.saldoCajaMenor = 0;
          reject(err);
        }
      });
    });
  }

  obtenerFechaActual(): string {
    const ahora = new Date();
    const anio = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const dia = String(ahora.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
  }

  obtenerFechaHoraActual(): string {
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
  }

  convertirMovimientoResponse(movResponse: MovimientoResponseDTO): Movimiento {
    const fechaHora = new Date(movResponse.fechaHora);
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const anio = fechaHora.getFullYear();
    const horas = String(fechaHora.getHours()).padStart(2, '0');
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
    const segundos = String(fechaHora.getSeconds()).padStart(2, '0');

    const fechaHoraFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    const fechaSolo = `${anio}-${mes}-${dia}`;

    const tipoNormalizado = movResponse.tipo.charAt(0).toUpperCase() + 
                           movResponse.tipo.slice(1).toLowerCase();

    return {
      id: movResponse.id.toString(),
      motivo: movResponse.motivo,
      valor: movResponse.valor,
      tipo: tipoNormalizado as 'Ingreso' | 'Egreso',
      fecha: fechaSolo,
      fechaHora: fechaHoraFormateada
    };
  }

  cargarMovimientosPorFecha(fecha: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.movimientoService.obtenerMovimientosPorFecha(fecha).subscribe({
        next: (data) => {
          this.movimientos = data.map(mov => this.convertirMovimientoResponse(mov));
          this.movimientosFiltrados = [...this.movimientos];
          this.calcularTotales();
          resolve();
        },
        error: (err) => {
          console.error('Error al cargar movimientos:', err);
          this.movimientos = [];
          this.movimientosFiltrados = [];
          this.calcularTotales();
          reject(err);
        }
      });
    });
  }

  calcularTotales() {
    this.ingresos = this.movimientos
      .filter(m => m.tipo === 'Ingreso')
      .reduce((sum, m) => sum + m.valor, 0);
    
    this.egresos = this.movimientos
      .filter(m => m.tipo === 'Egreso')
      .reduce((sum, m) => sum + m.valor, 0);
    
    this.actualizarTotalEfectivo();
  }

  filtrarMovimientos() {
    if (this.fechaFiltro) {
      this.movimientosFiltrados = this.movimientos.filter(
        movimiento => movimiento.fecha === this.fechaFiltro
      );
    } else {
      this.movimientosFiltrados = [...this.movimientos];
    }
  }

  async onFechaChange() {
    if (this.fechaFiltro) {
      await this.cargarMovimientosPorFecha(this.fechaFiltro);
    }
  }

  mostrarModal(action: 'ingreso' | 'egreso') {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    this.limpiarCampos();
    this.currentAction = action;
    this.movimientoEnEdicion = null;
    this.modalTitle = action === 'ingreso' ? 'Agregar ingreso' : 'Agregar egreso';
    this.actionButtonText = action === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso';
    const modal = document.getElementById('ingresoModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  mostrarModalCierreCaja() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }

    // Calcular totales para el cierre
    this.totalVentasCierre = this.totalVentas;
    
    // Egresos de la fecha actual
    this.totalEgresosCierre = this.movimientosFiltrados
      .filter(m => m.tipo === 'Egreso')
      .reduce((sum, m) => sum + m.valor, 0);
    
    // Ingresos de la fecha actual + ventas del día
    const ingresosDelDia = this.movimientosFiltrados
      .filter(m => m.tipo === 'Ingreso')
      .reduce((sum, m) => sum + m.valor, 0);
    
    this.totalIngresosCierre = ingresosDelDia + this.totalVentas;

    // Limpiar el campo de valor de cierre
    this.valorCierreFormateado = '';
    setTimeout(() => {
      const valorCierreInput = document.getElementById('valorCierre') as HTMLInputElement;
      if (valorCierreInput) {
        valorCierreInput.value = '';
      }
    }, 0);

    const modal = document.getElementById('cierreCajaModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  ocultarModalCierreCaja() {
    const modal = document.getElementById('cierreCajaModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  async confirmarCierreCaja() {
    const valorCierre = parseFloat(this.valorCierreFormateado.replace(/,/g, ''));

    if (isNaN(valorCierre) || valorCierre <= 0) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un valor válido para el cierre de caja'
      });
      return;
    }

    this.cajaMenorService.cerrarCaja(valorCierre).subscribe({
      next: async (success) => {
        if (success) {
          this.ocultarModalCierreCaja();
          
          // Actualizar el saldo de caja menor después del cierre
          await this.consultarSaldoCajaMenor();
          this.actualizarTotalEfectivo();
          
          Swal.fire({
            icon: 'success',
            title: '¡Caja cerrada!',
            text: 'La caja menor ha sido cerrada exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        console.error('Error al cerrar caja:', err);
        this.ocultarModalCierreCaja();
      }
    });
  }

  editarMovimiento(movimiento: Movimiento) {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    
    this.currentAction = 'editar';
    this.movimientoEnEdicion = movimiento;
    this.modalTitle = 'Editar movimiento';
    this.actionButtonText = 'Actualizar registro';

    this.valorFormateado = movimiento.valor.toLocaleString('en-US');
    
    setTimeout(() => {
      const valorInput = document.getElementById('valor') as HTMLInputElement;
      const motivoInput = document.getElementById('motivo') as HTMLTextAreaElement;
      
      if (valorInput) {
        valorInput.value = this.valorFormateado;
      }
      if (motivoInput) {
        motivoInput.value = movimiento.motivo;
      }

      const modal = document.getElementById('ingresoModal');
      if (modal) {
        modal.style.display = 'block';
      }
    }, 0);
  }

  eliminarMovimiento(movimiento: Movimiento) {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: `Se eliminará el ${movimiento.tipo.toLowerCase()} por valor de ${movimiento.valor.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 })}`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      reverseButtons: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        // Llamar al servicio para eliminar en el backend
        this.movimientoService.eliminarMovimiento(movimiento.id).subscribe({
          next: async (success) => {
            if (success) {
              // Recargar los movimientos desde el backend
              await this.cargarMovimientosPorFecha(this.fechaFiltro);
              
              // Actualizar el saldo de caja menor
              await this.consultarSaldoCajaMenor();
              this.actualizarTotalEfectivo();
            }
          },
          error: (err) => {
            console.error('Error al eliminar movimiento:', err);
          }
        });
      }
    });
  }

  limpiarCampos() {
    this.valorFormateado = '';
    const valorInput = document.getElementById('valor') as HTMLInputElement;
    const motivoInput = document.getElementById('motivo') as HTMLTextAreaElement;
    
    if (valorInput) {
      valorInput.value = '';
    }
    if (motivoInput) {
      motivoInput.value = '';
    }
  }

  ocultarModal() {
    const modal = document.getElementById('ingresoModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.movimientoEnEdicion = null;
  }

  procesarTransaccion() {
    const valorNumerico = parseFloat(this.valorFormateado.replace(/,/g, ''));
    const motivoInput = (<HTMLTextAreaElement>document.getElementById('motivo')).value;

    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      if (this.currentAction === 'editar' && this.movimientoEnEdicion) {
        this.actualizarMovimiento(valorNumerico, motivoInput);
      } else {
        this.crearMovimiento(valorNumerico, motivoInput);
      }
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un valor válido mayor a 0'
      });
    }
  }

  private async crearMovimiento(valorNumerico: number, motivo: string) {
    const tipo = this.currentAction === 'ingreso' ? 'Ingreso' : 'Egreso';
    
    let movimientoDTO = MovimientoDTO.crearMovimientoDTO(valorNumerico, tipo, motivo);
    
    this.movimientoService.crearMovimiento(movimientoDTO).subscribe(async (success) => {
      if (success) {
        this.ocultarModal();
        await this.cargarMovimientosPorFecha(this.fechaFiltro);
        
        // Actualizar el saldo de caja menor después de crear un movimiento
        await this.consultarSaldoCajaMenor();
        this.actualizarTotalEfectivo();
      }
    });
  }

  private actualizarMovimiento(valorNumerico: number, motivo: string) {
    if (!this.movimientoEnEdicion) return;

    const index = this.movimientos.findIndex(m => m.id === this.movimientoEnEdicion!.id);
    
    if (index !== -1) {
      const movimientoAntiguo = this.movimientos[index];
      
      if (movimientoAntiguo.tipo === 'Ingreso') {
        this.ingresos -= movimientoAntiguo.valor;
      } else {
        this.egresos -= movimientoAntiguo.valor;
      }

      if (movimientoAntiguo.tipo === 'Ingreso') {
        this.ingresos += valorNumerico;
      } else {
        this.egresos += valorNumerico;
      }

      this.movimientos[index] = {
        ...movimientoAntiguo,
        valor: valorNumerico,
        motivo: motivo || 'Sin descripción',
        fechaHora: this.obtenerFechaHoraActual()
      };

      this.actualizarTotalEfectivo();
      this.filtrarMovimientos();
      this.ocultarModal();

      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'El movimiento ha sido actualizado exitosamente',
        timer: 2000,
        showConfirmButton: false
      });
    }
  }

  actualizarTotalEfectivo() {
    // El saldoCajaMenor ahora viene del backend, no lo calculamos localmente
    this.totalEfectivo = this.totalVentas + this.saldoCajaMenor;
  }

  obtenerVentas(): Promise<void> {
    return new Promise((resolve, reject) => {
      let page = 0;
      this.ventas = [];

      const obtenerVentasRecursivamente = (paginaActual: number): void => {
        this.cajaService.getVentas(paginaActual).subscribe({
          next: (data) => {
            if (data.content.length > 0) {
              this.ventas = [...this.ventas, ...data.content];
              obtenerVentasRecursivamente(paginaActual + 1);
            } else {
              console.log('Todas las ventas han sido cargadas:', this.ventas.length);
              resolve();
            }
          },
          error: (err) => {
            console.error('Error al listar ventas:', err);
            reject(err);
          }
        });
      };

      obtenerVentasRecursivamente(page);
    });
  }

  sumarVentasDelDia(ventas: VentaDTO[]): number {
    const fechaActual = new Date().toISOString().split('T')[0];
    const ventasDelDia = ventas.filter(venta => venta.fecha.startsWith(fechaActual));
    const totalVentas = ventasDelDia.reduce((suma, venta) => suma + venta.total, 0);
    return totalVentas;
  }

  limpiarDatos() {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }

    Swal.fire({
      title: '¿Está seguro?',
      text: 'Se eliminarán todos los datos de movimientos',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, limpiar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.totalVentas = 0;
        this.saldoCajaMenor = 0;
        this.totalEfectivo = 0;
        this.ingresos = 0;
        this.egresos = 0;
        this.movimientos = [];
        this.movimientosFiltrados = [];

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
    let reporte = ReporteDTO.crearReporte(
      this.totalEfectivo,
      this.saldoCajaMenor,
      this.totalVentas,
      this.movimientosFiltrados
    );
    this.reporteService.imprimirReporte(reporte);
  }
}