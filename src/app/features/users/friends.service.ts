import { computed, inject, Injectable } from '@angular/core';
import { injectReducer, injectSpacetimeDB, injectTable } from 'spacetimedb/angular';
import { Identity } from 'spacetimedb';
import { reducers, tables } from '../../../module_bindings';
import { AuthService } from '../auth/auth.service';
import { UsersService } from './users.service';

/**
 * Friends, friend requests and practice status.
 *
 * The server keeps these in private tables and only exposes per-user views
 * (`my_friend_requests`, `my_friendships`, `friend_practice_status`), so every row read
 * here already belongs to the logged-in user (or to one of their friends).
 */
@Injectable({
  providedIn: 'root'
})
export class FriendsService {
  private auth = inject(AuthService);
  private users = inject(UsersService);
  private conn = injectSpacetimeDB();

  private requestRows = injectTable(tables.myFriendRequests);
  private friendshipRows = injectTable(tables.myFriendships);
  private statusRows = injectTable(tables.friendPracticeStatus);

  private sendRequestReducer = injectReducer(reducers.sendFriendRequest);
  private respondReducer = injectReducer(reducers.respondToFriendRequest);
  private cancelReducer = injectReducer(reducers.cancelFriendRequest);
  private removeFriendReducer = injectReducer(reducers.removeFriend);
  private setPracticeEventReducer = injectReducer(reducers.setPracticeEvent);

  /** True once the SpacetimeDB connection is up. */
  connected = computed(() => this.conn().isActive);

  /** Requests other people have sent to the logged-in user, oldest first. */
  incomingRequests = computed(() => {
    const me = this.auth.identity();
    if (!me) return [];
    return this.requestRows()
      .rows.filter((r) => r.recipient.isEqual(me))
      .map((r) => ({ request: r, from: this.users.getUserProfile(r.sender) }))
      .sort((a, b) => Number(a.request.createdAt.microsSinceUnixEpoch - b.request.createdAt.microsSinceUnixEpoch));
  });

  /** Requests the logged-in user has sent and that are still waiting for an answer. */
  outgoingRequests = computed(() => {
    const me = this.auth.identity();
    if (!me) return [];
    return this.requestRows().rows.filter((r) => r.sender.isEqual(me));
  });

  /** Drives the notification icon in the nav bar. */
  hasIncomingRequests = computed(() => this.incomingRequests().length > 0);

  /** The logged-in user's friends with their online state and the event they have open, sorted by name. */
  friends = computed(() => {
    const statuses = this.statusRows().rows;
    return this.friendshipRows()
      .rows.map((f) => {
        const user = this.users.getUserProfile(f.friend);
        const status = statuses.find((s) => s.identity.isEqual(f.friend));
        return {
          identity: f.friend,
          name: user?.name ?? 'Unknown',
          online: user?.online ?? false,
          /** Only set while the friend is online with the timer page open. */
          practicingEvent: user?.online ? status?.event : undefined,
          since: f.since,
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  isFriend(identity: Identity): boolean {
    return this.friendshipRows().rows.some((f) => f.friend.isEqual(identity));
  }

  /** The pending request the logged-in user sent to `identity`, if any. */
  outgoingRequestTo(identity: Identity) {
    return this.outgoingRequests().find((r) => r.recipient.isEqual(identity));
  }

  /** The pending request `identity` sent to the logged-in user, if any. */
  incomingRequestFrom(identity: Identity) {
    return this.incomingRequests().find((r) => r.request.sender.isEqual(identity))?.request;
  }

  sendRequest(recipient: Identity) {
    this.sendRequestReducer({ recipient });
  }

  accept(requestId: bigint) {
    this.respondReducer({ requestId, accept: true });
  }

  deny(requestId: bigint) {
    this.respondReducer({ requestId, accept: false });
  }

  cancelRequest(requestId: bigint) {
    this.cancelReducer({ requestId });
  }

  removeFriend(friend: Identity) {
    this.removeFriendReducer({ friend });
  }

  /** Tells friends which event the timer page has open; pass undefined when it closes. */
  setPracticeEvent(event: string | undefined) {
    if (!this.auth.isAuthenticated || !this.connected()) return;
    this.setPracticeEventReducer({ event });
  }
}
