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
  MatSelectModule
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
    MatSelectModule
  ],
  declarations: []
})
export class MaterialModule { }
