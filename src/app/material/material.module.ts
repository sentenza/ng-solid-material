import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
// Material components
import { MatToolbarModule, MatIconModule, MatSidenavModule } from '@angular/material'

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule
  ],
  declarations: []
})
export class MaterialModule { }
