import { SenderError, t } from 'spacetimedb/server';
import { spacetimedb } from '../schema';
import { tick } from '../ticker';

/** Lets the logged-in user broadcast a short message ("Sam: ...") to their friends' tickers. */
export const sendTick = spacetimedb.reducer(
  { message: t.string() },
  (ctx, { message }) => {
    const user = ctx.db.user.identity.find(ctx.sender);
    if (!user) throw new SenderError('You must be logged in to send ticks');

    const trimmed = message.trim();
    if (!trimmed) throw new SenderError('Message cannot be empty');
    if (trimmed.length > 140) throw new SenderError('Message must be 140 characters or fewer');

    tick(ctx, ctx.sender, `${user.name}: ${trimmed}`);
  }
);
