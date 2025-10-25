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
  totalExterno: number = 0;
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
  valorFormateado: string = '';
  private cajaService: CajaService = inject(CajaService);
  fechaFiltro: string = '';
  movimientoEnEdicion: Movimiento | null = null;

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
      
      // Cargar movimientos por fecha desde el backend
      await this.cargarMovimientosPorFecha(this.fechaFiltro);
      
      this.actualizarTotalEfectivo();
    } catch (error) {
      console.error('Error durante la inicialización:', error);
    }
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
    // Convertir la fecha ISO del backend a formato local
    const fechaHora = new Date(movResponse.fechaHora);
    const dia = String(fechaHora.getDate()).padStart(2, '0');
    const mes = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const anio = fechaHora.getFullYear();
    const horas = String(fechaHora.getHours()).padStart(2, '0');
    const minutos = String(fechaHora.getMinutes()).padStart(2, '0');
    const segundos = String(fechaHora.getSeconds()).padStart(2, '0');

    const fechaHoraFormateada = `${dia}/${mes}/${anio} ${horas}:${minutos}:${segundos}`;
    const fechaSolo = `${anio}-${mes}-${dia}`;

    // Normalizar el tipo (el backend devuelve INGRESO/EGRESO, el frontend usa Ingreso/Egreso)
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
    }).then((result) => {
      if (result.isConfirmed) {
        const index = this.movimientos.findIndex(m => m.id === movimiento.id);
        
        if (index !== -1) {
          if (movimiento.tipo === 'Ingreso') {
            this.ingresos -= movimiento.valor;
          } else {
            this.egresos -= movimiento.valor;
          }

          this.movimientos.splice(index, 1);
          
          this.actualizarTotalEfectivo();
          this.filtrarMovimientos();

          Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El movimiento ha sido eliminado exitosamente',
            timer: 2000,
            showConfirmButton: false
          });
        }
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

  private crearMovimiento(valorNumerico: number, motivo: string) {
    const tipo = this.currentAction === 'ingreso' ? 'Ingreso' : 'Egreso';
    
    let movimientoDTO = MovimientoDTO.crearMovimientoDTO(valorNumerico, tipo, motivo);
    
    this.movimientoService.crearMovimiento(movimientoDTO).subscribe((success) => {
      if (success) {
        this.ocultarModal();
        // Recargar los movimientos de la fecha actual
        this.cargarMovimientosPorFecha(this.fechaFiltro);
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
    this.totalEfectivo = this.totalVentas + this.ingresos - this.egresos;
    this.totalExterno = this.ingresos - this.egresos;
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
        this.totalExterno = 0;
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
      this.totalExterno,
      this.totalVentas,
      this.movimientosFiltrados
    );
    this.reporteService.imprimirReporte(reporte);
  }
}