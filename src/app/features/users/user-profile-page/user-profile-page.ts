import { UsersService } from './../users.service';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreeByThreeIcon } from '../../shared/icons/3x3-icon';
import { TwoByTwoIcon } from '../../shared/icons/2x2-icon';
import { FourByFourIcon } from '../../shared/icons/4x4-icon';
import { FiveByFiveIcon } from '../../shared/icons/5x5-icon';

@Component({
  selector: 'app-user-profile',
  imports: [ThreeByThreeIcon, TwoByTwoIcon, FourByFourIcon, FiveByFiveIcon],
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
