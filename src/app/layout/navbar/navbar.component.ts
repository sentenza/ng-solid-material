import { Component, OnInit, Output, EventEmitter } from '@angular/core'
import { SolidAuthService } from '../../auth/solid-auth.service'
import { Subscription } from 'rxjs'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  title = 'Angular Solid App'
  loggedIn: Boolean
  loggedInSub: Subscription

  @Output() openSidebar: EventEmitter<null> = new EventEmitter()

  constructor(private authService: SolidAuthService) { }

  ngOnInit() {
    this.loggedInSub = this.authService.currentSession.subscribe(
      session => {
        this.loggedIn = !session ? false : true
      }
    )
  }

}
