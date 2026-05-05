import { schema, table, t, SenderError } from 'spacetimedb/server';
import { User, UserIdentity } from './schema/user';
import { Solve } from './schema/solve';



const spacetimedb = schema({
  user: User,
  userIdentity: UserIdentity,
  solve: Solve
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

export const register = spacetimedb.reducer( 
  { name: t.string(), email: t.string() },
  (ctx, { name, email }) => {
    if (!name.trim()) throw new SenderError('Name cannot be empty');
    if (!email.trim()) throw new SenderError('Email cannot be empty');

    const existingIdentity = ctx.db.userIdentity.identity.find(ctx.sender);
    if (existingIdentity) {
      const user = ctx.db.user.id.find(existingIdentity.userId);
      if (user) {
        ctx.db.user.id.update({ ...user, name, online: true });
      }
      return;
    }

    const existingUser = ctx.db.user.email.find(email);
    if (existingUser) {
      ctx.db.userIdentity.insert({ identity: ctx.sender, userId: existingUser.id });
      ctx.db.user.id.update({ ...existingUser, name, online: true });
    } else {
      const newUser = ctx.db.user.insert({
        id: 0n,
        email,
        name,
        online: true,
      });
      ctx.db.userIdentity.insert({ identity: ctx.sender, userId: newUser.id });
    }
  }
);

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