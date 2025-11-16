import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaMasVendidosComponent } from './lista-mas-vendidos.component';

describe('ListaMasVendidosComponent', () => {
  let component: ListaMasVendidosComponent;
  let fixture: ComponentFixture<ListaMasVendidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMasVendidosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListaMasVendidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
