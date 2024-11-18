import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalAssignPeripheralComponent } from './modal-assign-peripheral.component';

describe('ModalAssignPeripheralComponent', () => {
  let component: ModalAssignPeripheralComponent;
  let fixture: ComponentFixture<ModalAssignPeripheralComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalAssignPeripheralComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalAssignPeripheralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
