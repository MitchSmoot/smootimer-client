import type { Identity } from 'spacetimedb';
import type { InferSchema, ReducerCtx } from 'spacetimedb/server';
import { spacetimedb } from './schema';

type Ctx = ReducerCtx<InferSchema<typeof spacetimedb>>;

/** Ticks kept per actor; older ones are deleted as new ones arrive. */
const MAX_TICKS_PER_ACTOR = 20;

/**
 * Adds a message to the ticker of all of `actor`'s friends (they read it through the
 * `friend_ticks` view; the ticker UI only shows while a friend is online).
 * Used by the lifecycle hooks, `add_solve` and the client-callable `tick` reducer.
 */
export function tick(ctx: Ctx, actor: Identity, message: string) {
  ctx.db.tick.insert({ id: 0n, actor, message, createdAt: ctx.timestamp });

  const mine = [...ctx.db.tick.tick_actor.filter(actor)];
  if (mine.length > MAX_TICKS_PER_ACTOR) {
    mine.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    for (const old of mine.slice(0, mine.length - MAX_TICKS_PER_ACTOR)) {
      ctx.db.tick.id.delete(old.id);
    }
  }
}

/** 12345 -> "12.345", 72345 -> "1:12.345". */
export function formatSolveTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const millis = ms % 1000;
  const fraction = `${seconds.toString().padStart(minutes ? 2 : 1, '0')}.${millis.toString().padStart(3, '0')}`;
  return minutes ? `${minutes}:${fraction}` : fraction;
}
