
import { tables } from '../module_bindings';
import * as moduleBindings from '../module_bindings/index';
import { Identity, ConnectionId, Event, ReducerEvent } from 'spacetimedb';

const conn = moduleBindings.DbConnection.builder()
  .withUri('ws://localhost:3000')
  .withDatabaseName('my-database-name')
  .onConnect((ctx, identity, token) => {
    console.log('Connected with identity:', identity);
  })
  .onConnectError((ctx, error) => {
    console.error('Connection error:', error);
  })
  .build();