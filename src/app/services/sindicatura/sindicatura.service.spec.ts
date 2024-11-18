import { TestBed } from '@angular/core/testing';

import { SindicaturaService } from './sindicatura.service';

describe('SindicaturaService', () => {
  let service: SindicaturaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SindicaturaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
