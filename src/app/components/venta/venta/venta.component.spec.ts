import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VentaComponent } from './venta.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MenuComponent } from '../../menu/menu.component';
import { NuevoComponent } from '../../clientes/nuevo/nuevo.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

describe('VentaComponent', () => {
  let component: VentaComponent;
  let fixture: ComponentFixture<VentaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VentaComponent, NuevoComponent],
      imports: [HttpClientTestingModule, ReactiveFormsModule, FormsModule],
      providers: [MenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VentaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
