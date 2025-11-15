import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VentasHoyComponent } from './ventas-hoy.component';

describe('VentasHoyComponent', () => {
  let component: VentasHoyComponent;
  let fixture: ComponentFixture<VentasHoyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VentasHoyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VentasHoyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
