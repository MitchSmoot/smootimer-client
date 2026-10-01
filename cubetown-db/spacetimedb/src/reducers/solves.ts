import { SenderError, t } from 'spacetimedb/server';
import { spacetimedb } from '../schema';
import { formatSolveTime, tick } from '../ticker';

const VALID_PENALTIES = ['none', '+2', 'dnf'];

function assertValidPenalty(penalty: string) {
  if (!VALID_PENALTIES.includes(penalty)) {
    throw new SenderError('Invalid penalty. Must be "none", "+2", or "dnf".');
  }
}

export const addSolve = spacetimedb.reducer(
  {
    event: t.string(),
    time: t.u32(),
    penalty: t.string(),
    scramble: t.string().optional(),
    comment: t.string().optional()
  },
  (ctx, { event, time, penalty, scramble, comment }) => {
    // Only logged-in users (those with a `user` row, see reducers/users.ts) can save solves.
    const user = ctx.db.user.identity.find(ctx.sender);
    if (!user) {
      throw new SenderError('You must be logged in to save solves.');
    }
    if (!event.trim()) throw new SenderError('Event cannot be empty.');
    assertValidPenalty(penalty);

    ctx.db.solve.insert({
      id: 0n,
      owner: ctx.sender,
      event,
      time,
      penalty,
      scramble,
      solvedAt: ctx.timestamp,
      comment
    });

    // Tell online friends. Built here (not by the client) so the name and time can't be faked.
    const shown = penalty === 'dnf' ? 'DNF' : penalty === '+2' ? `${formatSolveTime(time + 2000)} (+2)` : formatSolveTime(time);
    tick(ctx, ctx.sender, `${user.name} solved ${event}: ${shown}`);
  }
);

export const deleteSolve = spacetimedb.reducer(
  { solveId: t.u64() },
  (ctx, { solveId }) => {
    const solve = ctx.db.solve.id.find(solveId);
    // Same message for "missing" and "not yours" so ids of other users' solves can't be probed.
    if (!solve || !solve.owner.isEqual(ctx.sender)) throw new SenderError('Solve not found.');
    ctx.db.solve.id.delete(solveId);
  }
);

export const updatePenalty = spacetimedb.reducer(
  { solveId: t.u64(), penalty: t.string() },
  (ctx, { solveId, penalty }) => {
    assertValidPenalty(penalty);

    const solve = ctx.db.solve.id.find(solveId);
    if (!solve || !solve.owner.isEqual(ctx.sender)) throw new SenderError('Solve not found.');

    ctx.db.solve.id.update({ ...solve, penalty });
  }
);
