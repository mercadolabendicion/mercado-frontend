import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosProximosVencerComponent } from './productos-proximos-vencer.component';

describe('ProductosProximosVencerComponent', () => {
  let component: ProductosProximosVencerComponent;
  let fixture: ComponentFixture<ProductosProximosVencerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosProximosVencerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductosProximosVencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
