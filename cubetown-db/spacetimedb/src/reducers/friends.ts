import { SenderError, t } from 'spacetimedb/server';
import type { Identity } from 'spacetimedb';
import type { InferSchema, ReducerCtx } from 'spacetimedb/server';
import { spacetimedb } from '../schema';

type Ctx = ReducerCtx<InferSchema<typeof spacetimedb>>;

function requireUser(ctx: Ctx, identity: Identity, message: string) {
  const user = ctx.db.user.identity.find(identity);
  if (!user) throw new SenderError(message);
  return user;
}

/** The (owner -> friend) row, if any. One index lookup on `owner` plus a filter over that user's friends. */
function findFriendship(ctx: Ctx, owner: Identity, friend: Identity) {
  for (const row of ctx.db.friendship.friendship_owner.filter(owner)) {
    if (row.friend.isEqual(friend)) return row;
  }
  return undefined;
}

/** The pending request `from` -> `to`, if any. */
function findRequest(ctx: Ctx, from: Identity, to: Identity) {
  for (const row of ctx.db.friendRequest.friend_request_sender.filter(from)) {
    if (row.recipient.isEqual(to)) return row;
  }
  return undefined;
}

/** Inserts both directions of a friendship. */
function createFriendship(ctx: Ctx, a: Identity, b: Identity) {
  ctx.db.friendship.insert({ id: 0n, owner: a, friend: b, since: ctx.timestamp });
  ctx.db.friendship.insert({ id: 0n, owner: b, friend: a, since: ctx.timestamp });
}

/**
 * Sends a friend request to `recipient`. If they have already asked us, this accepts
 * their request instead so that two people adding each other end up as friends.
 */
export const sendFriendRequest = spacetimedb.reducer(
  { recipient: t.identity() },
  (ctx, { recipient }) => {
    requireUser(ctx, ctx.sender, 'You must be logged in to add friends');
    if (recipient.isEqual(ctx.sender)) throw new SenderError('You cannot add yourself as a friend');
    requireUser(ctx, recipient, 'User not found');

    if (findFriendship(ctx, ctx.sender, recipient)) throw new SenderError('You are already friends');
    if (findRequest(ctx, ctx.sender, recipient)) throw new SenderError('Friend request already sent');

    const theirs = findRequest(ctx, recipient, ctx.sender);
    if (theirs) {
      ctx.db.friendRequest.id.delete(theirs.id);
      createFriendship(ctx, ctx.sender, recipient);
      return;
    }

    ctx.db.friendRequest.insert({
      id: 0n,
      sender: ctx.sender,
      recipient,
      createdAt: ctx.timestamp,
    });
  }
);

/** The recipient of a request accepts or denies it. */
export const respondToFriendRequest = spacetimedb.reducer(
  { requestId: t.u64(), accept: t.bool() },
  (ctx, { requestId, accept }) => {
    const request = ctx.db.friendRequest.id.find(requestId);
    // Same message for "missing" and "not yours" so request ids can't be probed.
    if (!request || !request.recipient.isEqual(ctx.sender)) {
      throw new SenderError('Friend request not found');
    }

    ctx.db.friendRequest.id.delete(requestId);
    if (accept && !findFriendship(ctx, request.sender, request.recipient)) {
      createFriendship(ctx, request.sender, request.recipient);
    }
  }
);

/** The sender withdraws a request they made. */
export const cancelFriendRequest = spacetimedb.reducer(
  { requestId: t.u64() },
  (ctx, { requestId }) => {
    const request = ctx.db.friendRequest.id.find(requestId);
    if (!request || !request.sender.isEqual(ctx.sender)) {
      throw new SenderError('Friend request not found');
    }
    ctx.db.friendRequest.id.delete(requestId);
  }
);

/** Removes the friendship in both directions. */
export const removeFriend = spacetimedb.reducer(
  { friend: t.identity() },
  (ctx, { friend }) => {
    const mine = findFriendship(ctx, ctx.sender, friend);
    const theirs = findFriendship(ctx, friend, ctx.sender);
    if (!mine && !theirs) throw new SenderError('You are not friends');
    if (mine) ctx.db.friendship.id.delete(mine.id);
    if (theirs) ctx.db.friendship.id.delete(theirs.id);
  }
);

/**
 * Called by the timer page: `event` is what the user has open, or undefined when they
 * leave the page. Only the caller's own status can be written.
 */
export const setPracticeEvent = spacetimedb.reducer(
  { event: t.string().optional() },
  (ctx, { event }) => {
    requireUser(ctx, ctx.sender, 'You must be logged in');

    const trimmed = event?.trim();
    if (trimmed && trimmed.length > 64) throw new SenderError('Event name is too long');

    const existing = ctx.db.practiceStatus.identity.find(ctx.sender);
    if (!trimmed) {
      if (existing) ctx.db.practiceStatus.identity.delete(ctx.sender);
      return;
    }

    if (existing) {
      ctx.db.practiceStatus.identity.update({ ...existing, event: trimmed, updatedAt: ctx.timestamp });
    } else {
      ctx.db.practiceStatus.insert({ identity: ctx.sender, event: trimmed, updatedAt: ctx.timestamp });
    }
  }
);
