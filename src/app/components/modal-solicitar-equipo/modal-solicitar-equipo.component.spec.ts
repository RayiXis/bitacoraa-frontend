import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalSolicitarEquipoComponent } from './modal-solicitar-equipo.component';

describe('ModalSolicitarEquipoComponent', () => {
  let component: ModalSolicitarEquipoComponent;
  let fixture: ComponentFixture<ModalSolicitarEquipoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalSolicitarEquipoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalSolicitarEquipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
