import { TestBed } from '@angular/core/testing';

import { ServiciosPageService } from './servicios-page.service';

describe('ServiciosPageService', () => {
  let service: ServiciosPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServiciosPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
