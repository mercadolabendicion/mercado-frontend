export class MovimientoDTO {
    valor!: number;
    tipo!: string;
    motivo!: string;

    static crearMovimientoDTO(valor: number, tipo: string, motivo: string): MovimientoDTO {
        let movimiento = new MovimientoDTO();
        movimiento.valor = valor;
        movimiento.tipo = tipo;
        movimiento.motivo = motivo && motivo.trim() !== '' ? motivo : 'Sin descripción';
        return movimiento;
    }
}