import { UsersService } from './../users.service';
import { AuthService } from '../../auth/auth.service';
import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FriendsService } from '../friends.service';
import { FriendIcon } from '../../shared/icons/friend-icon';
import { Identity } from 'spacetimedb';
import { ThreeByThreeIcon } from '../../shared/icons/3x3-icon';
import { TwoByTwoIcon } from '../../shared/icons/2x2-icon';
import { FourByFourIcon } from '../../shared/icons/4x4-icon';
import { FiveByFiveIcon } from '../../shared/icons/5x5-icon';
import { TimeDisplayPipe } from '../../../core/time-display-pipe';

/** Mirrors the checks in the `set_profile` reducer; the server is still the source of truth. */
const WCA_ID_PATTERN = /^\d{4}[A-Za-z]{4}\d{2}$/;

@Component({
  selector: 'app-user-profile',
  imports: [ReactiveFormsModule, RouterLink, FriendIcon, ThreeByThreeIcon, TwoByTwoIcon, FourByFourIcon, FiveByFiveIcon, TimeDisplayPipe],
  templateUrl: './user-profile-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './user-profile-page.scss',
})
export class UserProfilePage {
  private route = inject(ActivatedRoute);
  private usersService = inject(UsersService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder).nonNullable;

  private params = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  /** Identity from the `users/:id` route, or undefined if the id isn't a valid identity. */
  private identity = computed(() => {
    const id = this.params().get('id');
    if (!id) return undefined;
    try {
      return Identity.fromString(id);
    } catch {
      return undefined;
    }
  });

  profile = computed(() => {
    const identity = this.identity();
    return identity ? this.usersService.getUserProfile(identity) : undefined;
  });

  records = computed(() => {
    const identity = this.identity();
    return identity ? this.usersService.getUserRecords(identity) : [];
  });

  /** True when the logged-in user is looking at their own profile. */
  isOwnProfile = computed(() => {
    const me = this.auth.identity();
    const identity = this.identity();
    return !!me && !!identity && me.isEqual(identity);
  });

  friends = inject(FriendsService);

  /** True when a logged-in user is looking at someone else's profile (friend actions apply). */
  canManageFriendship = computed(() => {
    const me = this.auth.identity();
    const identity = this.identity();
    return !!me && !!identity && !me.isEqual(identity) && !!this.profile();
  });

  isFriend = computed(() => {
    const identity = this.identity();
    return !!identity && this.friends.isFriend(identity);
  });

  /** The request I sent to this user that they haven't answered yet. */
  outgoingRequest = computed(() => {
    const identity = this.identity();
    return identity ? this.friends.outgoingRequestTo(identity) : undefined;
  });

  /** A request this user sent to me that I haven't answered yet. */
  incomingRequest = computed(() => {
    const identity = this.identity();
    return identity ? this.friends.incomingRequestFrom(identity) : undefined;
  });

  addFriend() {
    const identity = this.identity();
    if (identity) this.friends.sendRequest(identity);
  }

  removeFriend() {
    const identity = this.identity();
    if (identity) this.friends.removeFriend(identity);
  }

  editing = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(32), Validators.pattern(/\S/)]],
    wcaId: ['', [Validators.pattern(WCA_ID_PATTERN)]],
    realName: ['', [Validators.maxLength(64)]],
  });

  startEditing() {
    const profile = this.profile();
    if (!profile) return;
    this.form.reset({
      name: profile.name,
      wcaId: profile.wcaId ?? '',
      realName: profile.realName ?? '',
    });
    this.editing.set(true);
  }

  cancelEditing() {
    this.editing.set(false);
  }

  save() {
    if (!this.isOwnProfile() || this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, wcaId, realName } = this.form.getRawValue();
    this.usersService.updateProfile({ name, wcaId, realName });
    this.editing.set(false);
  }
}
