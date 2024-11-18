import { TestBed } from '@angular/core/testing';

import { BitacoraGuardGuard } from './bitacora.guard';

describe('BitacoraGuardGuard', () => {
  let guard: BitacoraGuardGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BitacoraGuardGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
