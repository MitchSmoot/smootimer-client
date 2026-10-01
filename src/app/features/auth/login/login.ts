import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './login.scss',
})
export class Login {
  protected auth = inject(AuthService);
  private router = inject(Router);

  constructor() {
    if (this.auth.isAuthenticated) {
      this.router.navigateByUrl('/');
    }
  }
}
