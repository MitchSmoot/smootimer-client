import { table, t } from "spacetimedb/server";

export const User = table(
  {
    name: 'user',
    public: true,
  },
  {
    id: t.u64().primaryKey().autoInc(),
    email: t.string().unique(),
    name: t.string(),
    online: t.bool(),
  }
);

export const UserIdentity = table(
  {
    name: 'user_identity',
    public: true,
    indexes: [{ accessor: 'ui_user_id', algorithm: 'btree', columns: ['userId'] }]
  },
  {
    identity: t.identity().primaryKey(),
    userId: t.u64(),
  }
);