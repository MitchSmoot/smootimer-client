import { schema, t, table } from "spacetimedb/server";

export const CubetownSchema = {
  /**
   * One row per authenticated (SpacetimeAuth / OIDC) user.
   *
   * The primary key is the SpacetimeDB `Identity`, which is derived from the
   * OIDC token's `iss` + `sub` claims. It is therefore stable across logins,
   * devices and browsers, and can't be forged by a client.
   *
   * Rows are created server-side in `clientConnected` (see reducers/users.ts).
   * Personal data such as the email address is intentionally NOT stored here
   * because this table is public.
   */
  user: table(
    {
      name: 'user',
      public: true,
    },
    {
      identity: t.identity().primaryKey(),
      name: t.string(),
      online: t.bool(),
      createdAt: t.timestamp(),
      // Optional profile details the user can add themselves (see `set_profile`).
      // New columns go last and carry a default so the published table can be migrated in place.
      wcaId: t.string().optional().default(undefined),
      realName: t.string().optional().default(undefined),
      // Focus mode (see `set_focus`): online, but not wanting to be disturbed. Reset on disconnect.
      focusing: t.bool().default(false),
    }
  ),
  /**
   * A single timed solve. `owner` is always set server-side from `ctx.sender`
   * (never from a client argument) and is what the delete / penalty reducers
   * check before letting anyone modify a row. The table stays public so other
   * users' profiles and leaderboards can read it.
   */
  solve: table(
    {
      public: true,
      indexes: [
        { accessor: 'solve_owner', algorithm: 'btree', columns: ['owner'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      owner: t.identity(),
      event: t.string(),
      time: t.u32(),
      solvedAt: t.timestamp(),
      penalty: t.string(),
      scramble: t.string().optional(),
      comment: t.string().optional()
    }
  ),

  // ---------------------------------------------------------------------------
  // Friends
  //
  // The tables below are PRIVATE: clients never read them directly, only through
  // the per-user views in views/friends.ts (which are scoped to `ctx.sender`).
  // ---------------------------------------------------------------------------

  /** A pending request. Deleted as soon as it is accepted, denied or cancelled. */
  friendRequest: table(
    {
      indexes: [
        { accessor: 'friend_request_sender', algorithm: 'btree', columns: ['sender'] },
        { accessor: 'friend_request_recipient', algorithm: 'btree', columns: ['recipient'] },
      ],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      sender: t.identity(),
      recipient: t.identity(),
      createdAt: t.timestamp(),
    }
  ),

  /**
   * One row per *direction* of a friendship: A+B is stored as (A -> B) and (B -> A).
   *
   * Storing both directions means "who are X's friends?" is a single index lookup on
   * `owner`, with no OR / second lookup, and the same lookup keys any per-friend
   * data. The future friend-activity ticker is then: friendship_owner(me) -> for each
   * `friend`, read that friend's newest rows through an index keyed by actor
   * (e.g. an `activity` table indexed on `actor`). It never has to scan a table.
   * Both rows are always inserted / deleted together by the reducers in reducers/friends.ts.
   */
  friendship: table(
    {
      indexes: [{ accessor: 'friendship_owner', algorithm: 'btree', columns: ['owner'] }],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      owner: t.identity(),
      friend: t.identity(),
      since: t.timestamp(),
    }
  ),

  /**
   * A short message shown in the ticker of the actor's friends ("Sam is online",
   * "Sam solved 3x3 in 12.345"). Stored ONCE per tick, keyed by `actor`, rather than
   * once per recipient: a friend reads them through `friend_ticks`, which is
   * friendship_owner(me) -> tick_actor(friend), i.e. two index lookups and no scan.
   * Only the newest few per actor are kept (see ticker.ts), so the table stays small.
   */
  tick: table(
    {
      indexes: [{ accessor: 'tick_actor', algorithm: 'btree', columns: ['actor'] }],
    },
    {
      id: t.u64().primaryKey().autoInc(),
      actor: t.identity(),
      message: t.string(),
      createdAt: t.timestamp(),
    }
  ),

  /**
   * What event a user currently has open in the timer page. A row exists only while
   * they are practicing (the client clears it when the page closes, and it is also
   * cleared when they disconnect). Looked up by identity, so friends' status is a
   * point lookup per friend.
   */
  practiceStatus: table(
    {},
    {
      identity: t.identity().primaryKey(),
      event: t.string(),
      updatedAt: t.timestamp(),
    }
  ),
}

export const spacetimedb = schema(CubetownSchema);
