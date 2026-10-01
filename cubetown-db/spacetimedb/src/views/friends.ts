import { t } from 'spacetimedb/server';
import { CubetownSchema, spacetimedb } from '../schema';

/**
 * Per-user windows onto the private friend tables. Each one is built only from index
 * lookups keyed on `ctx.sender` (or on the friends found that way), so SpacetimeDB can
 * invalidate them precisely and they never scan a table.
 */

/** Requests the caller has sent or received. */
export const my_friend_requests = spacetimedb.view(
  { name: 'my_friend_requests', public: true },
  t.array(CubetownSchema.friendRequest.rowType),
  ctx => [
    ...ctx.db.friendRequest.friend_request_recipient.filter(ctx.sender),
    ...ctx.db.friendRequest.friend_request_sender.filter(ctx.sender),
  ]
);

/** The caller's friends (one row per friend, `owner` is always the caller). */
export const my_friendships = spacetimedb.view(
  { name: 'my_friendships', public: true },
  t.array(CubetownSchema.friendship.rowType),
  ctx => [...ctx.db.friendship.friendship_owner.filter(ctx.sender)]
);

/** Recent ticks from the caller's friends (the caller's own ticks are not included). */
export const friend_ticks = spacetimedb.view(
  { name: 'friend_ticks', public: true },
  t.array(CubetownSchema.tick.rowType),
  ctx => {
    const ticks = [];
    for (const friendship of ctx.db.friendship.friendship_owner.filter(ctx.sender)) {
      ticks.push(...ctx.db.tick.tick_actor.filter(friendship.friend));
    }
    return ticks;
  }
);

/** What event each of the caller's friends currently has open in the timer page. */
export const friend_practice_status = spacetimedb.view(
  { name: 'friend_practice_status', public: true },
  t.array(CubetownSchema.practiceStatus.rowType),
  ctx => {
    const statuses = [];
    for (const friendship of ctx.db.friendship.friendship_owner.filter(ctx.sender)) {
      const status = ctx.db.practiceStatus.identity.find(friendship.friend);
      if (status) statuses.push(status);
    }
    return statuses;
  }
);
