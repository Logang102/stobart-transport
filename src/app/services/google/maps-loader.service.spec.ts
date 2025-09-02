import { TestBed } from '@angular/core/testing';

import { MapsLoaderService } from './maps-loader.service';

describe('MapsLoaderService', () => {
  let service: MapsLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapsLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
