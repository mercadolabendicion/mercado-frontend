import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductosStockMinimoComponent } from './productos-stock-minimo.component';

describe('ProductosStockMinimoComponent', () => {
  let component: ProductosStockMinimoComponent;
  let fixture: ComponentFixture<ProductosStockMinimoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductosStockMinimoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductosStockMinimoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
