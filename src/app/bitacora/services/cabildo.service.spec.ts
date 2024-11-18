import { TestBed } from '@angular/core/testing';

import { CabildoService } from './cabildo.service';

describe('CabildoService', () => {
  let service: CabildoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CabildoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
