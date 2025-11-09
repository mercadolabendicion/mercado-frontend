// scanner.service.ts
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ScannerModalComponent } from 'src/app/components/scanner-modal/scanner-modal.component';

@Injectable({
  providedIn: 'root',
})
export class ScannerService {
  constructor(private dialog: MatDialog) {}

  /**
   * Abre el escáner y retorna un Observable con el resultado
   */
  abrirCamara(): Observable<string | null> {
    return new Observable((observer) => {
      const dialogRef = this.dialog.open(ScannerModalComponent, {
        width: '100%',
        maxWidth: '450px',
        panelClass: ['scanner-modal', 'modal-fullscreen-sm-down'],
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        observer.next(result);
        observer.complete();
      });
    });
  }
}
