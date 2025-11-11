import { CanActivate, Router } from '@angular/router';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../services/shared/auth.service';

@Injectable({
  providedIn: 'root'
})
export class loginGuard implements CanActivate {
  
  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);

  canActivate(): boolean {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/app/cliente']); 
      return false; 
    } else {
      return true;
    }
  }
}
