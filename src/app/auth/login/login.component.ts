import { Component, OnInit, OnDestroy } from '@angular/core'
import { Router } from '@angular/router'
import { FormControl, Validators } from '@angular/forms'
import { SolidAuthService } from '../solid-auth.service'
import { SolidProvider } from '../../models/solid-provider.model'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  /**
   * A list of Solid Identity Providers
   * @type {SolidProvider[]}
   */
  identityProviders: SolidProvider[]

  /**
   * The URL of a custom identity provider
   * @type {string}
   */
  customProviderUrl: string

  /**
   * The provider URL currently selected
   * @type {string}
   */
  selectedProviderUrl: string

  /**
   * The FormControl that represents the select box for choosing the ID provider
   * @type {FormControl}
   */
  providerControl: FormControl

  loginSubscription: Subscription

  loggedIn: Boolean

  constructor(private authService: SolidAuthService, private router: Router) { }

  ngOnInit() {
    this.providerControl = new FormControl('', [Validators.required])
    this.identityProviders = this.authService.getIdentityProviders()
    this.authService.currentSession.subscribe(
      session => {
        this.loggedIn = !session ? false : true
      }
    )
  }

  ngOnDestroy() {
    if (this.loginSubscription) {
      this.loginSubscription.unsubscribe()
    }
  }

  /**
   * Handler for the login action
   */
  onLogin = () => {
    const idp: string = this.selectedProviderUrl ? this.selectedProviderUrl : this.customProviderUrl
    try {
      this.loginSubscription = this.authService.solidLogin(idp).subscribe(
        _ => {}, // just do nothing
        err => console.error('Error while calling the Solid Identity Provider: %o', err)
      )
    } catch (err) {
      console.error('An error has occurred logging in: %o', err)
    }
  }

  goToRegistration(): any {
    throw new Error('Function not implemented yet')
  }
}
