import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasschangePage } from './passchange.page';

describe('PasschangePage', () => {
  let component: PasschangePage;
  let fixture: ComponentFixture<PasschangePage>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(PasschangePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
