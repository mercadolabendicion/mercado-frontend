import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiaMasIngresosComponent } from './dia-mas-ingresos.component';

describe('DiaMasIngresosComponent', () => {
  let component: DiaMasIngresosComponent;
  let fixture: ComponentFixture<DiaMasIngresosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DiaMasIngresosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DiaMasIngresosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
