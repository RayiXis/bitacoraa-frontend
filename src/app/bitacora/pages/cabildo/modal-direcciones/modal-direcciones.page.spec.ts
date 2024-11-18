import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalDireccionesPage } from './modal-direcciones.page';

describe('ModalDireccionesPage', () => {
  let component: ModalDireccionesPage;
  let fixture: ComponentFixture<ModalDireccionesPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ModalDireccionesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
