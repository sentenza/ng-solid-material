import { Component, OnInit, ViewChild } from '@angular/core'
import { SolidAuthService } from '../auth/solid-auth.service'
import { SolidProfile } from '../models/solid-profile.model'
import { RdfService } from '../shared/rdf.service'
import { FormGroup, FormControl, FormGroupDirective, NgForm, Validators } from '@angular/forms'
import { ErrorStateMatcher } from '@angular/material/core'

/** Error when invalid control is dirty, touched, or submitted. */
export class FormErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted))
  }
}


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  /**
   * Avoids the display of the form if we're still loading the profile data
   * @type {Boolean}
   */
  loadingProfile: Boolean
  /**
   * The profile pic (URL)
   * @type {string}
   */
  profileImage = ''
  /**
   * This object will contain all the profile data
   * @type {SolidProfile}
   */
  profile: SolidProfile
  /**
   * The group of form fields that build up the Profile Form
   */
  profileForm: FormGroup
  matcher = new FormErrorStateMatcher()


  constructor(
    private authService: SolidAuthService,
    private rdfService: RdfService
    ) {
      this.profileForm = new FormGroup({
        name: new FormControl(),
        address: new FormControl(),
        phone: new FormControl(),
        email: new FormControl('', [Validators.email]),
        role: new FormControl(),
        company: new FormControl()
      })
    }

  ngOnInit() {
    this.loadProfile()
  }

  onSubmit() {
    throw new Error('Not implemented yet')
  }

  // Loads the profile from the rdf service and handles the response
  async loadProfile() {
    try {
      this.loadingProfile = true
      const profile = await this.rdfService.getProfile()
      if (profile) {
        console.log('The received profile: %o', profile)
        this.profile = profile
        this.authService.saveOldUserData(profile)
        this.updateProfileForm()
      }
      this.loadingProfile = false
      this.setupProfileData()
    } catch (error) {
      console.log(`Error: ${error}`)
    }
  }

  private updateProfileForm() {
    this.profileForm.setValue({
      name: this.profile.fn,
      address: !this.profile.address.street ? '' : this.profile.address.street,
      phone: !this.profile.phone ? '' : this.profile.phone,
      role: !this.profile.role ? '' : this.profile.role,
      email: this.profile.email,
      company: !this.profile.company ? '' : this.profile.company
    })
  }

  // Format data coming back from server. Intended purpose is to replace profile image with default if it's missing
  // and potentially format the address if we need to reformat it for this UI
  private setupProfileData() {
    if (this.profile) {
      this.profileImage = this.profile.image ? this.profile.image : 'assets/svg/solid-logo.svg'
    } else {
      this.profileImage = '/assets/images/profile.png'
    }
  }

}
