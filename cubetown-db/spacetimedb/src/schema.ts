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
  )
}

export const spacetimedb = schema(CubetownSchema);
