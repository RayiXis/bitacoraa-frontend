import { TestBed } from '@angular/core/testing';

import { ResetpassService } from './resetpass.service';

describe('ResetpassService', () => {
  let service: ResetpassService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ResetpassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
