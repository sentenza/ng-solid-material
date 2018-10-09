import { Component, OnInit, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {

  title = 'Angular Solid App'

  @Output() openSidebar: EventEmitter<null> = new EventEmitter()

  constructor() { }

  ngOnInit() {
  }

}
