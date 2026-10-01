import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { injectReducer, injectTable } from 'spacetimedb/angular';
import { reducers, tables } from '../../../module_bindings';
import { AuthService } from '../auth/auth.service';
import { FriendsService } from '../users/friends.service';
import { UsersService } from '../users/users.service';

/** How many ticks the ticker keeps on screen. */
const MAX_VISIBLE = 5;

export interface TickerMessage {
  id: bigint;
  text: string;
}

/**
 * The friend ticker.
 *
 * Reading: the server exposes a `friend_ticks` view (the recent ticks of the logged-in
 * user's friends). Ticks that already existed when this page loaded are history and are
 * ignored; only ones that arrive afterwards are shown. Ticks that arrive while the user
 * is in focus mode are treated the same way: they are skipped, not queued up for later.
 *
 * Writing: `tick()` adds a message to the ticker of all of the user's friends. Going
 * online / offline and submitting a solve are ticked by the server itself (see
 * cubetown-db `ticker.ts`) so they also work when the tab closes and can't be faked.
 * Focus mode only stops the user *receiving* ticks; what they do is still broadcast.
 */
@Injectable({
  providedIn: 'root'
})
export class TickerService {
  private auth = inject(AuthService);
  private friends = inject(FriendsService);
  private users = inject(UsersService);
  private tickRows = injectTable(tables.friendTicks);
  private sendTickReducer = injectReducer(reducers.sendTick);

  /** Highest tick id already seen / skipped; anything above it is new. */
  private baselineId = signal<bigint | undefined>(undefined);

  constructor() {
    effect(() => {
      const { rows, isLoading } = this.tickRows();
      if (isLoading) return;
      // Until the user focuses, this only sets the baseline once (initial data). While
      // focusing, it keeps moving up so ticks received in the meantime are dropped.
      if (this.baselineId() !== undefined && !this.users.focusing()) return;
      const max = rows.reduce((m, r) => (r.id > m ? r.id : m), this.baselineId() ?? 0n);
      if (max !== this.baselineId()) this.baselineId.set(max);
    });
  }

  /** Newest last. */
  messages = computed<TickerMessage[]>(() => {
    const baseline = this.baselineId();
    if (baseline === undefined) return [];
    return this.tickRows()
      .rows.filter((r) => r.id > baseline)
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
      .slice(-MAX_VISIBLE)
      .map((r) => ({ id: r.id, text: r.message }));
  });

  /** Shown for a logged-in user who is not focusing and has at least one friend online. */
  visible = computed(
    () =>
      this.auth.isAuthenticated &&
      !this.users.focusing() &&
      this.friends.friends().some((f) => f.online)
  );

  /** Adds `message` (prefixed with your name by the server) to the ticker of all your friends. */
  tick(message: string) {
    if (!this.auth.isAuthenticated || !this.friends.connected()) return;
    this.sendTickReducer({ message });
  }
}
