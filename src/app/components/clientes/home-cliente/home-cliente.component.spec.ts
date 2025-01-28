import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeClienteComponent } from './home-cliente.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { EditarClienteComponent } from '../editar-cliente/editar-cliente.component';
import { ReactiveFormsModule } from '@angular/forms';


describe('HomeClienteComponent', () => {
  let component: HomeClienteComponent;
  let fixture: ComponentFixture<HomeClienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HomeClienteComponent, EditarClienteComponent ],
      imports: [HttpClientTestingModule, ReactiveFormsModule],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeClienteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
