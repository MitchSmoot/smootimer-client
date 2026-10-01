import { UsersService } from './../users.service';
import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ThreeByThreeIcon } from '../../shared/icons/3x3-icon';
import { TwoByTwoIcon } from '../../shared/icons/2x2-icon';
import { FourByFourIcon } from '../../shared/icons/4x4-icon';
import { FiveByFiveIcon } from '../../shared/icons/5x5-icon';
import { Identity } from 'spacetimedb';

@Component({
  selector: 'app-user-profile',
  imports: [ThreeByThreeIcon, TwoByTwoIcon, FourByFourIcon, FiveByFiveIcon],
  templateUrl: './user-profile-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-profile-page.scss',
})
export class UserProfilePage implements OnInit {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  profile: any;

  ngOnInit() {
    const identity = this.route.snapshot.paramMap.get("identity") as unknown as Identity;
    this.profile = this.usersService.getUserProfile(identity);
  }
}
