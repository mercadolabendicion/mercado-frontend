import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresosByVentasComponent } from './ingresos-by-ventas.component';

describe('IngresosByVentasComponent', () => {
  let component: IngresosByVentasComponent;
  let fixture: ComponentFixture<IngresosByVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresosByVentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngresosByVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
