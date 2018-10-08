import { NgModule } from '@angular/core'
import { Routes, RouterModule } from '@angular/router'
import { HomeComponent } from './home/home.component'
import { AuthGuard } from './auth/auth.guard.service'
import { LoginComponent } from './auth/login/login.component'

const appRoutes: Routes = [
    {path: '', pathMatch: 'full', redirectTo: '/login'},
    {path: 'login', component: LoginComponent},
    {path: 'home', component: HomeComponent, canActivate: [AuthGuard]}
]

@NgModule({
    imports: [RouterModule.forRoot(appRoutes)],
    exports: [RouterModule],
    providers: []
})
export class AppRoutingModule {}
