import { TestBed } from '@angular/core/testing';

import { Senvio } from './senvio';

describe('Senvio', () => {
  let service: Senvio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Senvio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
