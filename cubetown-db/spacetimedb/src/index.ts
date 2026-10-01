import { spacetimedb } from './schema';

export default spacetimedb;

// User / authentication reducers and lifecycle hooks
export * from './reducers/users';
// Solve reducers (all scoped to the calling user)
export * from './reducers/solves';
// Friends: requests, friendships, practice status
export * from './reducers/friends';
export * from './views/friends';
// Friend ticker
export * from './reducers/ticker';

export const init = spacetimedb.init(_ctx => {
  // Called when the module is initially published
});
