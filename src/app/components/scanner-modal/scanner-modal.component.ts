import { Component, OnInit, ElementRef, ViewChild, OnDestroy, NgZone } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { BrowserMultiFormatReader, Result, DecodeHintType, BarcodeFormat } from '@zxing/library';

@Component({
  selector: 'app-scanner-modal',
  templateUrl: './scanner-modal.component.html',
  styleUrls: ['./scanner-modal.component.css']
})
export class ScannerModalComponent implements OnInit, OnDestroy {
  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  
  private codeReader: BrowserMultiFormatReader;
  private videoStream: MediaStream | null = null;
  protected scanningActive = true;

  constructor(
    private dialogRef: MatDialogRef<ScannerModalComponent>,
    private ngZone: NgZone
  ) {
    const hints = new Map<DecodeHintType, any>();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E
    ]);
    
    this.codeReader = new BrowserMultiFormatReader(hints);
  }

  ngOnInit(): void {
    this.startScanner();
  }

  async startScanner(): Promise<void> {
    try {
      // Obtener la cámara trasera si está disponible
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const backCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('trasera') ||
        device.label.toLowerCase().includes('environment')
      );

      const constraints = {
        video: {
          deviceId: backCamera ? { exact: backCamera.deviceId } : undefined,
          facingMode: backCamera ? undefined : 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          aspectRatio: { ideal: 1.777778 }
        }
      };

      this.videoStream = await navigator.mediaDevices.getUserMedia(constraints);
      this.video.nativeElement.srcObject = this.videoStream;
      await this.video.nativeElement.play();

      // Comenzar la decodificación continua
      this.codeReader.decodeFromStream(
        this.videoStream,
        this.video.nativeElement,
        (result: Result | null) => {
          if (result && this.scanningActive) {
            const scannedCode = result.getText();
            console.log('Código escaneado:', scannedCode);
            // Verificar si es un código de barras numérico válido
            if (/^\d+$/.test(scannedCode)) {
              this.scanningActive = false; // Evitar múltiples lecturas
              this.ngZone.run(() => {
                this.dialogRef.close(scannedCode);
              });
            }
          }
        }
      );

    } catch (error) {
      console.error('Error al acceder a la cámara:', error);
      alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
      this.closeScanner();
    }
  }

  closeScanner(): void {
    this.scanningActive = false;
    this.codeReader.reset();
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
    }
    this.dialogRef.close();
  }

  ngOnDestroy(): void {
    this.closeScanner();
  }
}
