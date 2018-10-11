import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Observable, from, defer } from 'rxjs'
declare let solid: any

// Service
import { RdfService } from '../shared/rdf.service'
import { SolidProvider } from '../models/solid-provider.model'

interface SolidSession {
  accessToken: string
  clientId: string
  idToken: string
  sessionKey: string
  webId: string
}

@Injectable({
  providedIn: 'root',
})
export class SolidAuthService {
  session: Observable<SolidSession>
  fechInit = {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/sparql-update',
    },
    body: '',
  }

  constructor(private router: Router, private rdf: RdfService) {
    this.getCurrentSession()
  }

  /**
   * TODO: Should we use the Rx.shareReplay() operator to avoid duplicates?
   * @type {Observable<SolidSession>}
   */
  public get currentSession(): Observable<SolidSession> {
    return from(solid.auth.currentSession())
  }

  /*
   * This will check if current session is active to avoid security problems
  */
  private getCurrentSession = async () => {
    this.session = from(solid.auth.currentSession())
  }

  /**
   * Makes a call to the solid auth endpoint.
   * It currently requires a callback url and a storage option or else
   * the call will fail.
   * Note: The Identity Provider URL it should be fetched using the list of
   * Identity Providers defined in getIdentityProviders().
   *
   * @param {string} idp Identity Provider URL
   * @see getIdentityProviders()
   * @see https://medium.com/@benlesh/rxjs-observable-interop-with-promises-and-async-await-bebb05306875
   */
  solidLogin(idp: string): Observable<any> {
    return defer(async function() {
      const loginOptions = {
        callbackUri: `${window.location.href}`,
        storage: localStorage
      }
      return await solid.auth.login(idp, loginOptions)
    })
  }

  /**
   * Signs out of Solid in this app, by calling the logout
   * function and clearing the localStorage token.
   */
  solidSignOut(): Observable<any> {
    return defer(async function() {
      try {
        return await solid.auth.logout()
      } catch (error) {
        console.error(error)
      }
    })
  }

  saveOldUserData = (profile: any) => {
    if (!localStorage.getItem('oldProfileData')) {
      localStorage.setItem('oldProfileData', JSON.stringify(profile))
    }
  }

  getOldUserData = () => {
    return JSON.parse(localStorage.getItem('oldProfileData'))
  }

  /**
   * Alternative login-popup function. This will open a popup that will allow you to choose an identity provider without
   * leaving the current page.
   * This is recommended if you don't want to leave the current workflow.
   */
  solidLoginPopup = async () => {
    try {
      await solid.auth.popupLogin({ popupUri: './login-popup'})
      // Check if session is valid to avoid redirect issues
      await this.getCurrentSession()

      // popupLogin success redirect to profile
      this.router.navigate(['/card'])
    } catch (error) {
      console.log(`Error: ${error}`)
    }
  }

  /**
   * Gets the providers. This is to mimic the future provider registry.
   *
   * @return {SolidProvider[]} A list of SolidProviders
   */
  getIdentityProviders(): SolidProvider[] {
    const inruptProvider: SolidProvider = {
      name: 'Inrupt',
      image: '/assets/images/Inrupt.png',
      loginUrl: 'https://inrupt.net/auth',
      desc: 'Inrupt Inc. provider'
    }
    const solidCommunityProvider: SolidProvider = {
      name: 'Solid Community',
      image: '/assets/images/Solid.png',
      loginUrl: 'https://solid.community',
      desc: 'A provider maintained by the Solid Community'
    }
    const otherProvider: SolidProvider = {
      name: 'Other (Enter WebID)',
      image: '/assets/images/Generic.png',
      loginUrl: null,
      desc: 'Generic provider'
    }

    return [
      inruptProvider,
      solidCommunityProvider,
      otherProvider
    ]
  }
}
