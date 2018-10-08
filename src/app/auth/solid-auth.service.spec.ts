import { TestBed, inject } from '@angular/core/testing'

import { SolidAuthService } from './solid-auth.service'

describe('SolidAuthService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SolidAuthService]
    })
  })

  it('should be created', inject([SolidAuthService], (service: SolidAuthService) => {
    expect(service).toBeTruthy()
  }))
})
