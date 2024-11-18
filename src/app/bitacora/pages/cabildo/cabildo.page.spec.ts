import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CabildoPage } from './cabildo.page';

describe('CabildoPage', () => {
  let component: CabildoPage;
  let fixture: ComponentFixture<CabildoPage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(CabildoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
