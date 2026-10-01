import { SenderError, t } from 'spacetimedb/server';
import { spacetimedb } from '../schema';
import { displayNameFromClaims, isTrustedUserToken } from '../auth';

/**
 * Called every time a client connects.
 *
 * If the connection was authenticated with a SpacetimeAuth token for our
 * client, make sure a `user` row exists for it (first login == sign-up) and
 * mark it online. Anonymous / foreign-issuer connections are "guests": they
 * can still read public data but never get a `user` row.
 */
export const onConnect = spacetimedb.clientConnected(ctx => {
  const claims = ctx.senderAuth.jwt;
  if (!isTrustedUserToken(claims)) return;

  const existing = ctx.db.user.identity.find(ctx.sender);
  if (existing) {
    ctx.db.user.identity.update({ ...existing, online: true });
    return;
  }

  ctx.db.user.insert({
    identity: ctx.sender,
    name: displayNameFromClaims(claims),
    online: true,
    createdAt: ctx.timestamp,
  });
});

export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const existing = ctx.db.user.identity.find(ctx.sender);
  if (existing) {
    ctx.db.user.identity.update({ ...existing, online: false });
  }
});

/** Lets a logged-in user change their display name. */
export const setName = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    const trimmed = name.trim();
    if (!trimmed) throw new SenderError('Name cannot be empty');
    if (trimmed.length > 32) throw new SenderError('Name must be 32 characters or fewer');

    const existing = ctx.db.user.identity.find(ctx.sender);
    if (!existing) throw new SenderError('You must be logged in to set a name');

    ctx.db.user.identity.update({ ...existing, name: trimmed });
  }
);
