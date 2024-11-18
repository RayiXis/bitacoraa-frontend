import { TestBed } from '@angular/core/testing';

import { RestorePasswordGuard } from './restore-password.guard';

describe('RestorePasswordGuard', () => {
  let guard: RestorePasswordGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(RestorePasswordGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
