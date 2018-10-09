import { Component, OnInit, ViewChild } from '@angular/core'
import { SolidAuthService } from '../auth/solid-auth.service'
import { NgForm } from '@angular/forms'

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

  loadingProfile: Boolean
  profileImage = ''
  // TODO: Make a model
  profile: any = {
    image: null,
    name: null,
    address: {},
    organization: null,
    role: null,
    phone: null,
    email: null
  }
  @ViewChild('f') cardForm: NgForm;

  constructor(private authService: SolidAuthService) { }

  ngOnInit() {
    this.loadingProfile = true
  }

  onSubmit() {
    throw new Error('Not implemented yet')
  }

}
