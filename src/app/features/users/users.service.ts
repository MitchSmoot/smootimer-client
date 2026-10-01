import { injectReducer, injectTable } from 'spacetimedb/angular';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { reducers, tables } from '../../../module_bindings';
import { Identity } from 'spacetimedb';
import { EventService } from '../smootimer/timer/event.service';
import { computeEventRecords, EventRecord } from './user-records';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private auth = inject(AuthService);
  private eventService = inject(EventService);
  protected users = injectTable(tables.user);
  private solves = injectTable(tables.solve);
  private setProfileReducer = injectReducer(reducers.setProfile);

  /** The `user` row for the logged-in person (created server-side on first login). Undefined for guests. */
  currentUser = computed(() => {
    const identity = this.auth.identity();
    if (!identity) return undefined;
    return this.users().rows.find((u) => u.identity.isEqual(identity));
  });

  getUsers() {
    return this.users().rows;
  }

  /** Reactive: re-reads whenever the user table changes. Use inside a `computed`. */
  getUserProfile(identity: Identity) {
    return this.users().rows.find((u) => u.identity.isEqual(identity));
  }

  /** Best single / best Ao5 for each event the given user has solved. Reactive like `getUserProfile`. */
  getUserRecords(identity: Identity): EventRecord[] {
    const solves = this.solves()
      .rows.filter((s) => s.owner.isEqual(identity))
      .map((s) => ({ event: s.event, time: s.time, penalty: s.penalty, solvedAt: s.solvedAt.toDate() }));
    return computeEventRecords(solves, this.eventService.events.map((e) => e.title));
  }

  /** Updates the logged-in user's own profile. Blank optional fields clear the stored value. */
  updateProfile(profile: { name: string; wcaId?: string; realName?: string }) {
    this.setProfileReducer({
      name: profile.name,
      wcaId: profile.wcaId?.trim() || undefined,
      realName: profile.realName?.trim() || undefined,
    });
  }
}
