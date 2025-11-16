import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductoMasVendidoComponent } from './producto-mas-vendido.component';

describe('ProductoMasVendidoComponent', () => {
  let component: ProductoMasVendidoComponent;
  let fixture: ComponentFixture<ProductoMasVendidoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductoMasVendidoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProductoMasVendidoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
