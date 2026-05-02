import { schema, table, t, SenderError } from 'spacetimedb/server';

const spacetimedb = schema({
  person: table(
    { public: true },
    {
      name: t.string(),
    }
  ),
    solve: table(
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
  ),
});
export default spacetimedb;

export const init = spacetimedb.init(_ctx => {
  // Called when the module is initially published
});

export const onConnect = spacetimedb.clientConnected(_ctx => {
  // Called every time a new client connects
});

export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {
  // Called every time a client disconnects
});

export const add = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    ctx.db.person.insert({ name });
  }
);

export const sayHello = spacetimedb.reducer(ctx => {
  for (const person of ctx.db.person.iter()) {
    console.info(`Hello, ${person.name}!`);
  }
  console.info('Hello, World!');
});

export const addSolve = spacetimedb.reducer(
  {
    event: t.string(),
    time: t.u32(),
    penalty: t.string(),
    scramble: t.string().optional(),
    comment: t.string().optional()
  },
  (ctx, { event, time, penalty, scramble, comment }) => {


    ctx.db.solve.insert({
      id: 0n,
      event,
      time,
      penalty,
      scramble,
      solvedAt: ctx.timestamp,
      comment
    });
  }
);

export const deleteSolve = spacetimedb.reducer(
  { solveId: t.u64() },
  (ctx, { solveId }) => {
    const solve = ctx.db.solve.id.find(solveId);
    if (!solve) throw new SenderError('Solve not found.');
    ctx.db.solve.id.delete(solveId);
  }
);

export const updatePenalty = spacetimedb.reducer(
  { solveId: t.u64(), penalty: t.string() },
  (ctx, { solveId, penalty }) => {
    const validPenalties = ['none', '+2', 'dnf'];
    if (!validPenalties.includes(penalty)) {
      throw new SenderError('Invalid penalty. Must be "none", "+2", or "dnf".');
    }

    const solve = ctx.db.solve.id.find(solveId);
    if (!solve) throw new SenderError('Solve not found.');

    ctx.db.solve.id.update({ ...solve, penalty });
  }
);