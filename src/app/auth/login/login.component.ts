import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
import { FormControl, Validators } from '@angular/forms'
import { SolidAuthService } from '../solid-auth.service'
import { SolidProvider } from '../../models/solid-provider.model'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
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

  constructor(private authService: SolidAuthService, private router: Router) { }

  ngOnInit() {
    this.providerControl = new FormControl('', [Validators.required])
    this.identityProviders = this.authService.getIdentityProviders()
  }

  onLogin = async () => {
    const idp: string = this.selectedProviderUrl ? this.selectedProviderUrl : this.customProviderUrl
    console.log('idp %o', idp)

    if (idp) {
      try {
        this.authService.solidLogin(idp)
      } catch (err) {
        console.error('An error has occurred logging in: %o', err)
      }
    }
  }

  goToRegistration(): any {
    throw new Error('Function not implemented yet')
  }
}
