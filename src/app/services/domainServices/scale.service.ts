import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';

export interface ScaleData {
    weight: number;
    unit: 'kg' | 'g' | 'lb';
    stable: boolean;
    timestamp?: string;
}

@Injectable({ providedIn: 'root' })
export class ScaleService {
    private ws: WebSocketSubject<ScaleData> | null = null;
    
    // ✅ OPCIÓN 1: Si lograste cerrar los procesos, usa puertos originales
    private readonly WS_URL = 'ws://localhost:8765';
    private readonly HTTP_URL = 'http://localhost:3000/lastWeight.json';
    
    // ✅ OPCIÓN 2: Si usas los nuevos puertos, descomenta estas líneas:
    // private readonly WS_URL = 'ws://localhost:8766';
    // private readonly HTTP_URL = 'http://localhost:3001/lastWeight.json';

    private weightSubject = new Subject<ScaleData>();
    public weight$: Observable<ScaleData> = this.weightSubject.asObservable();

    constructor() {
        console.log('[SCALE] Inicializando servicio de balanza...');
        console.log('[SCALE] WebSocket URL:', this.WS_URL);
        console.log('[SCALE] HTTP URL:', this.HTTP_URL);
    }

    private connectWebSocket(): void {
        if (this.ws && !this.ws.closed) {
            console.log('[SCALE] WebSocket ya está activo.');
            return;
        }

        console.log('[SCALE] 🔌 Conectando WebSocket a', this.WS_URL);
        this.ws = webSocket<ScaleData>({
            url: this.WS_URL,
            openObserver: {
                next: () => {
                    console.log('[SCALE] ✅ WebSocket CONECTADO correctamente.');
                },
            },
            closeObserver: {
                next: (event) => {
                    console.error('[SCALE] ❌ WebSocket CERRADO:', event.code, event.reason);
                    this.ws = null;
                    // Reconexión automática cada 2 segundos
                    setTimeout(() => {
                        console.log('[SCALE] 🔄 Intentando reconectar...');
                        this.connectWebSocket();
                    }, 2000);
                },
            },
        });

        this.ws.subscribe({
            next: (data) => {
                console.log('[SCALE] 📊 Peso recibido vía WebSocket:', data);
                this.weightSubject.next(data);
            },
            error: (err) => {
                console.error('[SCALE] ❌ Error en WebSocket:', err);
                this.ws = null;
                setTimeout(() => {
                    console.log('[SCALE] 🔄 Reconectando tras error...');
                    this.connectWebSocket();
                }, 2000);
            },
            complete: () => {
                console.log('[SCALE] ℹ️ WebSocket completado.');
            },
        });
    }

    isConnected(): boolean {
        const connected = this.ws ? !this.ws.closed : false;
        console.log('[SCALE] Estado de conexión:', connected);
        return connected;
    }

    connect(): Promise<boolean> {
        console.log('[SCALE] 🔌 Método connect() llamado.');
        if (this.isConnected()) {
            console.log('[SCALE] ✅ Ya está conectado.');
            return Promise.resolve(true);
        }
        
        this.connectWebSocket();
        
        // Espera hasta 5 segundos para verificar conexión
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 10; // 10 intentos x 500ms = 5s
            
            const check = setInterval(() => {
                attempts++;
                if (this.isConnected()) {
                    clearInterval(check);
                    console.log('[SCALE] ✅ Conexión establecida exitosamente.');
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(check);
                    console.warn('[SCALE] ⚠️ Timeout: No se pudo conectar en 5 segundos.');
                    resolve(false);
                }
            }, 500);
        });
    }

    disconnect(): Promise<void> {
        console.log('[SCALE] 🔌 Desconectando servicio...');
        if (this.ws) {
            this.ws.complete();
            this.ws = null;
            console.log('[SCALE] ✅ WebSocket cerrado.');
        }
        return Promise.resolve();
    }

    async getLastWeight(): Promise<ScaleData | null> {
        try {
            console.log('[SCALE] 📥 Cargando último peso desde:', this.HTTP_URL);
            const response = await fetch(this.HTTP_URL);
            
            if (response.ok) {
                const data: ScaleData = await response.json();
                console.log('[SCALE] ✅ Último peso cargado:', data);
                // Emite el dato al subject para actualizar UI inmediatamente
                this.weightSubject.next(data);
                return data;
            } else {
                console.error('[SCALE] ❌ HTTP error:', response.status, response.statusText);
                return null;
            }
        } catch (err) {
            console.error('[SCALE] ❌ Error en fetch:', err);
            return null;
        }
    }
}