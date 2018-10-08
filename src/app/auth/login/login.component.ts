import { Component, OnInit } from '@angular/core'
import { Router } from '@angular/router'
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

  constructor(private authService: SolidAuthService, private router: Router) { }

  ngOnInit() {
    this.identityProviders = this.authService.getIdentityProviders()
  }

  onLogin(): any {
    throw new Error('Function not implemented yet')
  }

  goToRegistration(): any {
    throw new Error('Function not implemented yet')
  }
}
