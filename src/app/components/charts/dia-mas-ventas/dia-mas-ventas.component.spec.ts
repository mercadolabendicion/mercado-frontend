import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaMasVentasComponent } from './dia-mas-ventas.component';

describe('DiaMasVentasComponent', () => {
  let component: DiaMasVentasComponent;
  let fixture: ComponentFixture<DiaMasVentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaMasVentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiaMasVentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
