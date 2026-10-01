import { Component, inject, Signal, ChangeDetectionStrategy } from '@angular/core';
import { Theme } from '../theme/theme';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { UsersService } from '../../users/users.service';
import { FriendsService } from '../../users/friends.service';
import { NotificationIcon } from '../icons/notification-icon';
@Component({
  selector: 'app-main-nav',
  imports: [RouterLink, NotificationIcon],
  templateUrl: './main-nav.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './main-nav.scss',
})
export class MainNav {
  theme = inject(Theme);
  isDarkModeActive: Signal<boolean> = this.theme.darkMode;
  auth = inject(AuthService);
  users = inject(UsersService);
  friends = inject(FriendsService);
  toggleTheme() {
    this.theme.toggleDarkMode();
  }
}
