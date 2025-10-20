import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

// Tipos mínimos para Web Serial API (sin dependencias extra)
declare global {
    interface Navigator { serial: { requestPort(): Promise<SerialPort>; getPorts(): Promise<SerialPort[]> } }
    interface SerialPort {
        readable: ReadableStream<Uint8Array> | null;
        writable: WritableStream<Uint8Array> | null;
        open(options: SerialOptions): Promise<void>;
        close(): Promise<void>;
    }
    interface SerialOptions {
        baudRate: number;
        dataBits?: 7 | 8;
        stopBits?: 1 | 2;
        parity?: 'none' | 'even' | 'odd';
        flowControl?: 'none' | 'hardware';
    }
}

export interface ScaleData {
    weight: number;    // en kg por defecto
    unit: 'kg' | 'g' | 'lb';
    stable: boolean;
}

@Injectable({ providedIn: 'root' })
export class ScaleService {
    private port: SerialPort | null = null;
    private reader: ReadableStreamDefaultReader<string> | null = null;

    private weightSubject = new Subject<ScaleData>();
    public weight$: Observable<ScaleData> = this.weightSubject.asObservable();

    // Config de la balanza SAT CS30HT típica
    private readonly CONFIG: SerialOptions = {
        baudRate: 9600,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
    };

    // Número de decimales que quieres publicar (0.225 => 3)
    private readonly DECIMALS = 3;

    async connect(): Promise<boolean> {
        try {
            if (!('serial' in navigator)) throw new Error('Web Serial no soportada. Usa Chrome/Edge.');

            // Importante: DEBE llamarse desde un gesto de usuario (click)
            this.port = await navigator.serial.requestPort();
            await this.port.open(this.CONFIG);

            // Inicia lectura
            this.startReading().catch(err => console.error('[SCALE] startReading error:', err));
            return true;
        } catch (error) {
            console.error('Error al conectar con la balanza:', error);
            this.port = null;
            return false;
        }
    }

    private async startReading(): Promise<void> {
        if (!this.port?.readable) return;

        const decoder = new TextDecoderStream();
        // Encadena binario->texto y captura errores del pipe
        this.port.readable.pipeTo(decoder.writable).catch(err => console.error('[SCALE] pipeTo error:', err));

        this.reader = decoder.readable.getReader();
        let buffer = '';

        while (true) {
            const { value, done } = await this.reader.read();
            if (done) break;
            if (!value) continue;

            buffer += value;

            // Divide por CR, LF o ETX (\x03)
            const lines = buffer.split(/[\r\n\u0003]+/);
            buffer = lines.pop() || '';

            for (const raw of lines) {
                // Limpia control chars (incluye STX \x02), paréntesis y espacios
                const cleaned = raw
                    .replace(/[\x00-\x1F\x7F]/g, '')
                    .replace(/[()]/g, '')
                    .trim();

                if (!cleaned) continue;

                const parsed = this.parseScaleData(cleaned);
                if (!parsed) continue;

                // Redondeo matemático a 3 decimales (0.225)
                const factor = Math.pow(10, this.DECIMALS);
                const rounded = Math.round(parsed.weight * factor) / factor;

                this.weightSubject.next({ ...parsed, weight: rounded });
                // Si quieres ver el número exacto en consola:
                // console.log('Peso:', rounded.toFixed(this.DECIMALS));
            }
        }
    }

    // Parser tolerante: acepta "ST,GS,+001.250kg" y también "0.225"
    private parseScaleData(data: string): ScaleData | null {
        try {
            const line = data.replace(',', '.').trim();

            // Formato con prefijo y unidad
            const mFull = line.match(/^(ST|US)?[^0-9\-+]*([\-+]?\d+(?:\.\d+)?)[ ]*(kg|g|lb)?/i);
            if (mFull) {
                const stable = (mFull[1]?.toUpperCase() ?? 'ST') === 'ST';
                const value = parseFloat(mFull[2]);
                const unit = (mFull[3]?.toLowerCase() as 'kg' | 'g' | 'lb') ?? 'kg';
                if (Number.isFinite(value)) return { weight: value, unit, stable };
            }

            // Solo número (ej. "0.225")
            const mNum = line.match(/([\-+]?\d+(?:\.\d+)?)/);
            if (mNum) {
                const value = parseFloat(mNum[1]);
                if (Number.isFinite(value)) return { weight: value, unit: 'kg', stable: true };
            }

            return null;
        } catch {
            return null;
        }
    }

    async disconnect(): Promise<void> {
        try {
            if (this.reader) {
                await this.reader.cancel().catch(() => { });
                this.reader.releaseLock();
                this.reader = null;
            }
            if (this.port) {
                await this.port.close().catch(() => { });
                this.port = null;
            }
        } catch (error) {
            console.error('Error al desconectar:', error);
        }
    }

    isConnected(): boolean {
        return !!this.port;
    }
}
