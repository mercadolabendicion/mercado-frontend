import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalCajaMenorComponent } from './total-caja-menor.component';

describe('TotalCajaMenorComponent', () => {
  let component: TotalCajaMenorComponent;
  let fixture: ComponentFixture<TotalCajaMenorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalCajaMenorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TotalCajaMenorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
