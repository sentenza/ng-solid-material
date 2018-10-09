import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core'
import { SolidAuthService } from '../../auth/solid-auth.service'
import { Subscription } from 'rxjs'
import { Router } from '@angular/router'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  title = 'Angular Solid App'
  loggedIn: Boolean
  loggedInSub: Subscription
  loggedOutSub: Subscription

  @Output() openSidebar: EventEmitter<null> = new EventEmitter()

  constructor(private authService: SolidAuthService, private router: Router) { }

  ngOnInit() {
    this.checkSession()
  }

  ngOnDestroy() {
    if (this.loggedInSub) {
      this.loggedInSub.unsubscribe()
    }
    if (this.loggedOutSub) {
      this.loggedOutSub.unsubscribe()
    }
  }

  logout() {
    this.loggedOutSub = this.authService.solidSignOut().subscribe(
      res => {
        console.log('logout response: %o', res)
        // Remove localStorage
        localStorage.removeItem('solid-auth-client')
        // Redirect to login page
        this.router.navigate(['/'])
        this.checkSession()
      }
    )
  }

  /**
   * Checks and sets the Solid session
   * @private
   */
  private checkSession() {
    this.loggedInSub = this.authService.currentSession.subscribe(
      session => {
        this.loggedIn = !session ? false : true
      }
    )
  }

}
