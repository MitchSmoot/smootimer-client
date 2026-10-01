import { injectTable } from 'spacetimedb/angular';
import { computed, inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { tables } from '../../../module_bindings';
import { Identity } from 'spacetimedb';



@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private auth = inject(AuthService);
  protected users = injectTable(tables.user);

  /** The `user` row for the logged-in person (created server-side on first login). Undefined for guests. */
  currentUser = computed(() => {
    const identity = this.auth.identity();
    if (!identity) return undefined;
    return this.users().rows.find((u) => u.identity.isEqual(identity));
  });

  getUsers() {
    return this.users().rows;
  }

  getUserProfile(identity: Identity) {
    return this.users().rows.find((u) => u.identity.isEqual(identity));
  }
}
