import { Component, inject, OnInit } from '@angular/core';
import { UsersService } from '../users.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-page',
  imports: [],
  templateUrl: './user-page.html',
  styleUrl: './user-page.scss'
})
export class UserPage {
  private router = inject(Router);
  private usersService = inject(UsersService);
  users = this.usersService.getUsers();

  userClicked(user: any) {
    this.router.navigate(['/users', user.id]);
  }
}
