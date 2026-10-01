import { Component, inject, Signal } from '@angular/core';
import { Theme } from '../theme/theme';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
@Component({
  selector: 'app-main-nav',
  imports: [RouterLink],
  templateUrl: './main-nav.html',
  styleUrl: './main-nav.scss'
})
export class MainNav {
  theme = inject(Theme);
  isDarkModeActive: Signal<boolean> = this.theme.darkMode;
  auth = inject(AuthService);
  users = inject(UsersService);
  toggleTheme() {
    this.theme.toggleDarkMode();
  }
}
