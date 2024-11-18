import { TestBed } from '@angular/core/testing';

import { TecnicosServiciosdataService } from './tecnicos-serviciosdata.service';

describe('TecnicosServiciosdataService', () => {
  let service: TecnicosServiciosdataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TecnicosServiciosdataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
