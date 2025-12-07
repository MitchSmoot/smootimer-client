import { UsersService } from './../users.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  imports: [],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss'
})
export class UserProfilePage implements OnInit{
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  id: number | undefined;
  profile: any;

  ngOnInit(){
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.usersService.getUserProfile(this.id).then(profile => {this.profile = profile;});
  }
}
