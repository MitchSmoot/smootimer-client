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
    wcaId: undefined,
    realName: undefined,
  });
});

export const onDisconnect = spacetimedb.clientDisconnected(ctx => {
  const existing = ctx.db.user.identity.find(ctx.sender);
  if (existing) {
    ctx.db.user.identity.update({ ...existing, online: false });
  }
  // Closing the tab means they are no longer on the timer page.
  if (ctx.db.practiceStatus.identity.find(ctx.sender)) {
    ctx.db.practiceStatus.identity.delete(ctx.sender);
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

/** WCA IDs look like `2015SMIT01`: four-digit year, four letters, two digits. */
const WCA_ID_PATTERN = /^\d{4}[A-Z]{4}\d{2}$/;

/**
 * Lets a logged-in user edit their own profile: display name (required) plus an
 * optional WCA ID and real name. A missing / blank optional value clears that field.
 * Only ever touches the caller's own row (`ctx.sender`).
 */
export const setProfile = spacetimedb.reducer(
  {
    name: t.string(),
    wcaId: t.string().optional(),
    realName: t.string().optional(),
  },
  (ctx, { name, wcaId, realName }) => {
    const existing = ctx.db.user.identity.find(ctx.sender);
    if (!existing) throw new SenderError('You must be logged in to edit your profile');

    const trimmedName = name.trim();
    if (!trimmedName) throw new SenderError('Name cannot be empty');
    if (trimmedName.length > 32) throw new SenderError('Name must be 32 characters or fewer');

    const trimmedWcaId = wcaId?.trim().toUpperCase() || undefined;
    if (trimmedWcaId !== undefined && !WCA_ID_PATTERN.test(trimmedWcaId)) {
      throw new SenderError('WCA ID must look like 2015SMIT01');
    }

    const trimmedRealName = realName?.trim() || undefined;
    if (trimmedRealName !== undefined && trimmedRealName.length > 64) {
      throw new SenderError('Real name must be 64 characters or fewer');
    }

    ctx.db.user.identity.update({
      ...existing,
      name: trimmedName,
      wcaId: trimmedWcaId,
      realName: trimmedRealName,
    });
  }
);
