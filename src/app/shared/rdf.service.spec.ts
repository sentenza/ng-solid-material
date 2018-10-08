import { TestBed, inject } from '@angular/core/testing'

import { RdfService } from './rdf.service'

describe('RdfService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RdfService]
    })
  })

  it('should be created', inject([RdfService], (service: RdfService) => {
    expect(service).toBeTruthy()
  }))
})
