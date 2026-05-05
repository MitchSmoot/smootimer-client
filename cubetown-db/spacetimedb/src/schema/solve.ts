import { table, t } from "spacetimedb/server";

export const Solve = table(
  {
    public: true,
    indexes: [
      { accessor: 'solve_solver', algorithm: 'btree', columns: ['event'] },
    ],
  },
  {
    id: t.u64().primaryKey().autoInc(),
    event: t.string(),
    time: t.u32(),
    solvedAt: t.timestamp(),
    penalty: t.string(),
    scramble: t.string().optional(),
    comment: t.string().optional()
  }
)