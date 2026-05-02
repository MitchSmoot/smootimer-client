
import { environment } from '../environments/environment';
import { tables } from '../module_bindings';
import * as moduleBindings from '../module_bindings/index';
import { Identity, ConnectionId, Event, ReducerEvent } from 'spacetimedb';

const HOST = environment.SPACETIMEDB_HOST;
const DB_NAME = environment.SPACETIMEDB_DB_NAME;

export const conn = moduleBindings.DbConnection.builder()
  .withUri(HOST)
  .withDatabaseName(DB_NAME)
  .onConnect((ctx, identity, token) => {
    console.log('Connected with identity:', identity);
  })
  .onConnectError((ctx, error) => {
    console.error('Connection error:', error);
  })
  .build();