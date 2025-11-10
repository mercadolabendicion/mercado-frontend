import { Component, OnInit, ElementRef, ViewChild, OnDestroy, NgZone, AfterViewInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import Quagga from '@ericblade/quagga2';

@Component({
  selector: 'app-scanner-modal',
  templateUrl: './scanner-modal.component.html',
  styleUrls: ['./scanner-modal.component.css']
})
export class ScannerModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('scannerContainer', { static: false }) scannerContainer!: ElementRef<HTMLDivElement>;
  
  protected scanningActive = true;
  protected errorMessage: string = '';
  protected isLoading: boolean = true;
    // Evita procesar detecciones hasta pasados unos milisegundos desde que el video arranca
  private allowDetection: boolean = false;
  private detectionDelayMs: number = 2000; // esperar 2 segundos
  private scannerInitialized = false;

  constructor(
    private dialogRef: MatDialogRef<ScannerModalComponent>,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (!this.scannerContainer || !this.scannerContainer.nativeElement) {
      this.handleError(new Error('Contenedor del scanner no disponible'));
      return;
    }
    
    // Dar tiempo para que el DOM esté listo
    setTimeout(() => {
      this.startScanner();
    }, 500);
  }

  async startScanner(): Promise<void> {
    if (this.scannerInitialized) {
      return;
    }

    this.scannerInitialized = true;

    try {
      this.isLoading = true;
      this.errorMessage = '';

      // Verificar soporte del navegador
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Tu navegador no soporta acceso a la cámara');
      }
      console.log('[SCANNER] ✅ Navegador compatible');

      // Verificar elemento DOM
      if (!this.scannerContainer?.nativeElement) {
        throw new Error('Contenedor del scanner no disponible');
      }
      
      // Detener instancias previas
      try {
        Quagga.stop();
        console.log('[SCANNER] Instancias previas detenidas');
      } catch (e) {
        console.log('[SCANNER] No había instancias previas');
      }

      const config: any = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: this.scannerContainer.nativeElement,
          constraints: {
            width: { min: 640, ideal: 1280, max: 1920 },
            height: { min: 480, ideal: 720, max: 1080 },
            facingMode: "environment"
          },
          area: {
            top: "0%",
            right: "0%",
            left: "0%",
            bottom: "0%"
          }
        },
        locator: {
          patchSize: "medium",
          halfSample: true
        },
        numOfWorkers: navigator.hardwareConcurrency || 2,
        decoder: {
          readers: [
            "ean_reader",
            "ean_8_reader",
            "code_128_reader",
            "code_39_reader",
            "upc_reader",
            "upc_e_reader"
          ],
          debug: {
            drawBoundingBox: true,
            showFrequency: false,
            drawScanline: true,
            showPattern: false
          }
        },
        locate: true,
        frequency: 10
      };
      
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err: any) => {
          if (err) {
            console.error('[SCANNER] ❌ Error en Quagga.init:', err);
            reject(err);
            return;
          }

          try {
            Quagga.start();
            // Esperamos a que el stream esté corriendo y el DOM muestre el video
            this.ngZone.run(() => {
              this.isLoading = false;
            });

            // Activar detección después de un pequeño retardo para dar tiempo al autofocus y estabilizar el video
            setTimeout(() => {
              this.allowDetection = true;
              console.log('[SCANNER] ⏱️ Detección habilitada después de', this.detectionDelayMs, 'ms');
            }, this.detectionDelayMs);

            resolve();
          } catch (startError) {
            console.error('[SCANNER] ❌ Error en Quagga.start:', startError);
            reject(startError);
          }
        });
      });

      let detectionCount = 0;
      
      Quagga.onDetected((result: any) => {
        detectionCount++;
        // Si aún no permitimos detección (periodo de estabilización), ignoramos
        if (!this.allowDetection) {
          // Opcional: log cada cierto número de detecciones para depuración
          if (detectionCount % 30 === 0) {
            console.log('[SCANNER] esperando a estabilizar video antes de procesar detecciones...');
          }
          return;
        }
        if (!this.scanningActive) {
          return;
        }

        const code = result?.codeResult?.code;
        const format = result?.codeResult?.format;
        
        console.log('[SCANNER] 📊 Código RAW:', code);
        console.log('[SCANNER] 📊 Formato:', format);

        if (!code) {
          return;
        }

        const cleanCode = code.trim();
        console.log('[SCANNER] 🧹 Código limpio:', cleanCode);

        if (this.isValidBarcode(cleanCode, format)) {
          console.log('[SCANNER] 🎯 Código final:', cleanCode);
          
          this.scanningActive = false;
          this.playBeep();
          
          this.ngZone.run(() => {
            this.stopScanner();
            this.dialogRef.close(cleanCode);
          });
        } else {
          console.log('[SCANNER] ❌ Código inválido, continuando escaneo');
        }
      });

      console.log('[SCANNER] ✅ ====== SCANNER LISTO ======');

    } catch (error: any) {
      console.error('[SCANNER] ❌❌❌ ERROR CRÍTICO ❌❌❌');
      console.error('[SCANNER] Error:', error);
      console.error('[SCANNER] Stack:', error?.stack);
      
      this.ngZone.run(() => {
        this.isLoading = false;
        this.handleError(error);
      });
    }
  }

  private isValidBarcode(code: string, format?: string): boolean {
    console.log('[SCANNER] 🔍 Validando:', { code, format, length: code.length });

    if (!code || code.length === 0) {
      console.log('[SCANNER] ❌ Código vacío');
      return false;
    }

    // Códigos muy cortos probablemente sean errores
    if (code.length < 4) {
      console.log('[SCANNER] ❌ Código muy corto');
      return false;
    }

    // Validar caracteres
    const validPattern = /^[0-9A-Za-z\-\s]+$/;
    if (!validPattern.test(code)) {
      console.log('[SCANNER] ❌ Caracteres inválidos');
      return false;
    }
    return true;
  }

  private handleError(error: any): void {
    const errorName = error?.name || '';
    console.log('[SCANNER] 💬 Manejando error:', errorName);

    if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError') {
      this.errorMessage = 'Permiso de cámara denegado. Permite el acceso en la configuración del navegador.';
    } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
      this.errorMessage = 'No se encontró cámara en este dispositivo.';
    } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
      this.errorMessage = 'La cámara está siendo usada por otra aplicación.';
    } else if (errorName === 'OverconstrainedError') {
      this.errorMessage = 'La cámara no soporta la configuración requerida.';
    } else {
      this.errorMessage = `Error: ${error?.message || 'Error desconocido'}`;
    }

    console.log('[SCANNER] 💬 Mensaje:', this.errorMessage);
  }

  private playBeep(): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.value = 800;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
    }
  }

  private stopScanner(): void {
    try {
      if (this.scannerInitialized) {
        Quagga.offDetected();
        Quagga.offProcessed();
        Quagga.stop();
        console.log('[SCANNER] ✅ Scanner detenido');
      }
    } catch (e) {
      console.error('[SCANNER] ❌ Error al detener:', e);
    }
  }

  closeScanner(): void {
    console.log('[SCANNER] 🚪 Cerrando por botón...');
    this.scanningActive = false;
    this.stopScanner();
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    console.log('[SCANNER] 🧹 ngOnDestroy');
    this.stopScanner();
  }
}