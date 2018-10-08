import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router
} from '@angular/router'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

import { SolidAuthService } from './solid-auth.service'


@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private auth: SolidAuthService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {

    const isLoggedIn = localStorage.getItem('solid-auth-client') ? true : false
    console.log('isLoggedIn: %o', isLoggedIn)

    if (!isLoggedIn) {
      this.router.navigateByUrl('/login')
    }

    return isLoggedIn
    /*
     this.auth.session.pipe(
      take(1),
      map(session => !!session),
      tap(loggedIn => {
        if (!loggedIn) {
          return this.router.navigate(['/']);
        }
      })
    );
    */
  }
}
