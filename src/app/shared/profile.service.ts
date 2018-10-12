import { Injectable } from '@angular/core'
import { SolidProfile, SolidAddress } from '../models/solid-profile.model'
import * as $rdf from 'rdflib'
import { ProfileTrait } from './profile-trait'
import { RdfService } from './rdf.service'


/**
 * Manages all the profile-related operations
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService implements ProfileTrait {

  /**
   * Graph Knowledge Base Store
   * @private
   */
  private kb: $rdf.Graph

  constructor(rdfService: RdfService) {
    this.kb = $rdf.Graph()
  }

  toTurtle(): string {
    return 'not implemented yet'
  }
}
