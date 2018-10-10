import { Component, OnInit } from '@angular/core'
import { environment } from '../../../environments/environment'

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  /** App version */
  version: string

  /** Repository URL */
  repoURL: string

  constructor() {
    this.version = environment.app.version
    this.repoURL = environment.app.repository
  }

  ngOnInit() {
  }

}
