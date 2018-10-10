import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// Material components
import {
  MatToolbarModule,
  MatIconModule,
  MatSidenavModule,
  MatButtonModule,
  MatMenuModule,
  MatListModule,
  MatSelectModule,
  MatProgressSpinnerModule,
  MatInputModule,
} from '@angular/material'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    MatButtonModule,
    MatMenuModule,
    MatListModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatInputModule
  ],
  declarations: []
})
export class MaterialModule { }
