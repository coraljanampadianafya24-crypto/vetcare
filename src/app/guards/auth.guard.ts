import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ 
  providedIn: 'root' 
})
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(private readonly auth: AuthService, 
    private readonly router: Router) {}
  canActivate(): boolean | UrlTree { 
    return this.auth.isAuthenticated() || this.router.createUrlTree(['/acceso']); 
  }
  canActivateChild(): boolean | UrlTree { 
    return this.canActivate(); 
  }
}
