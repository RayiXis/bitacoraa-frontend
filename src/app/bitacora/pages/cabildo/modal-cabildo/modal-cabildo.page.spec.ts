import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalCabildoPage } from './modal-cabildo.page';

describe('ModalCabildoPage', () => {
  let component: ModalCabildoPage;
  let fixture: ComponentFixture<ModalCabildoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(ModalCabildoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
