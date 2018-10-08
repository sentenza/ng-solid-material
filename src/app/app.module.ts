import { BrowserModule } from '@angular/platform-browser'
import { NgModule } from '@angular/core'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'
import { MaterialModule } from './material/material.module'


import { AppComponent } from './app.component'
import { NavbarComponent } from './layout/navbar/navbar.component'
import { FooterComponent } from './layout/footer/footer.component'
import { HomeComponent } from './home/home.component'
import { AppRoutingModule } from './app-routing.module'
import { LoginComponent } from './auth/login/login.component'
import { RdfService } from './shared/rdf.service'

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    FooterComponent,
    HomeComponent,
    LoginComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    FormsModule,
    HttpClientModule,
    MaterialModule,
    BrowserAnimationsModule
  ],
  providers: [
    RdfService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
