import { Component, inject } from '@angular/core';
import { MenuComponent } from 'src/app/components/menu/menu.component';
import { VentaDTO } from 'src/app/dto/venta/VentaDTO';
import { ReporteDTO } from 'src/app/dto/reporte/ReporteDTO';
import { CajaService } from 'src/app/services/domainServices/caja.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ReporteService } from 'src/app/services/domainServices/reporte.service';

interface Movimiento {
  motivo: string;
  valor: number;
  tipo: 'Ingreso' | 'Egreso';
  fecha: string; // Fecha en formato YYYY-MM-DD
  fechaHora: string; // Fecha y hora completa para mostrar
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
  currentAction: 'ingreso' | 'egreso' = 'ingreso';
  protected ventas: VentaDTO[];
  private reporteService: ReporteService = inject(ReporteService);
  valorFormateado: string = '';
  private cajaService: CajaService = inject(CajaService);
  fechaFiltro: string = ''; // Fecha seleccionada en el datepicker

  constructor(private menuComponent: MenuComponent) {
    this.ventas = [];
  }

  formatearValor(event: Event): void {
    const input = event.target as HTMLInputElement;
    // Remover todo excepto números
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
    // Establecer fecha actual como filtro predeterminado
    this.fechaFiltro = this.obtenerFechaActual();

    this.cargarDatos();
    try {
      await this.obtenerVentas();
      this.totalVentas = this.sumarVentasDelDia(this.ventas);
      this.actualizarTotalEfectivo();
      this.filtrarMovimientos();
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

  filtrarMovimientos() {
    if (this.fechaFiltro) {
      this.movimientosFiltrados = this.movimientos.filter(
        movimiento => movimiento.fecha === this.fechaFiltro
      );
    } else {
      this.movimientosFiltrados = [...this.movimientos];
    }
  }

  onFechaChange() {
    this.filtrarMovimientos();
  }

  mostrarModal(action: 'ingreso' | 'egreso') {
    if (this.menuComponent.estadoMenu) {
      this.menuComponent.cerrarMenu();
    }
    this.limpiarCampos();
    this.currentAction = action;
    this.modalTitle = action === 'ingreso' ? 'Agregar ingreso' : 'Agregar egreso';
    this.actionButtonText = action === 'ingreso' ? 'Registrar ingreso' : 'Registrar egreso';
    const modal = document.getElementById('ingresoModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  limpiarCampos() {
    this.valorFormateado = '';
    const motivoInput = <HTMLTextAreaElement>document.getElementById('motivo');
    if (motivoInput) {
      motivoInput.value = '';
    }
  }

  ocultarModal() {
    const modal = document.getElementById('ingresoModal');
    if (modal) {
      modal.style.display = 'none';
    }
  }

  procesarTransaccion() {
    const valorNumerico = parseFloat(this.valorFormateado.replace(/,/g, ''));
    const motivoInput = (<HTMLTextAreaElement>document.getElementById('motivo')).value;

    if (!isNaN(valorNumerico) && valorNumerico > 0) {
      const nuevoMovimiento: Movimiento = {
        motivo: motivoInput || 'Sin descripción',
        valor: valorNumerico,
        tipo: this.currentAction === 'ingreso' ? 'Ingreso' : 'Egreso',
        fecha: this.obtenerFechaActual(),
        fechaHora: this.obtenerFechaHoraActual()
      };

      if (this.currentAction === 'ingreso') {
        this.ingresos += valorNumerico;
      } else {
        this.egresos += valorNumerico;
      }

      this.movimientos.push(nuevoMovimiento);
      this.actualizarTotalEfectivo();
      this.guardarDatos();
      this.filtrarMovimientos(); // Actualizar la vista filtrada
      this.ocultarModal();

      Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: `${this.currentAction === 'ingreso' ? 'Ingreso' : 'Egreso'} registrado exitosamente`,
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingrese un valor válido mayor a 0'
      });
    }
  }

  actualizarTotalEfectivo() {
    this.totalEfectivo = this.totalVentas + this.ingresos - this.egresos;
    this.totalExterno = this.ingresos - this.egresos;
  }

  guardarDatos() {
    localStorage.setItem('totalVentas', this.totalVentas.toString());
    localStorage.setItem('totalExterno', this.totalExterno.toString());
    localStorage.setItem('totalEfectivo', this.totalEfectivo.toString());
    localStorage.setItem('ingresos', this.ingresos.toString());
    localStorage.setItem('egresos', this.egresos.toString());
    localStorage.setItem('movimientos', JSON.stringify(this.movimientos));
  }

  cargarDatos() {
    this.totalVentas = parseFloat(localStorage.getItem('totalVentas') || '0');
    this.totalExterno = parseFloat(localStorage.getItem('totalExterno') || '0');
    this.totalEfectivo = parseFloat(localStorage.getItem('totalEfectivo') || '0');
    this.ingresos = parseFloat(localStorage.getItem('ingresos') || '0');
    this.egresos = parseFloat(localStorage.getItem('egresos') || '0');

    const movimientosGuardados = localStorage.getItem('movimientos');
    if (movimientosGuardados) {
      this.movimientos = JSON.parse(movimientosGuardados);
    } else {
      this.movimientos = [];
    }
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
        localStorage.removeItem('totalVentas');
        localStorage.removeItem('totalExterno');
        localStorage.removeItem('totalEfectivo');
        localStorage.removeItem('ingresos');
        localStorage.removeItem('egresos');
        localStorage.removeItem('movimientos');

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