import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, signal } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { DbConnection } from '../module_bindings';
import { provideSpacetimeDB } from 'spacetimedb/angular';
import { Identity } from 'spacetimedb';

const HOST = environment.SPACETIMEDB_HOST;
const DB_NAME = environment.SPACETIMEDB_DB_NAME;

const currentIdentity = signal<Identity | null>(null);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),

      provideSpacetimeDB(
        DbConnection.builder()
        .withUri(HOST)
        .withDatabaseName(DB_NAME)
        .withToken(localStorage.getItem('auth_token') || undefined)
        .onConnect((conn, identity, token) => {
          localStorage.setItem('auth_token', token);
          currentIdentity.set(identity);
          console.log('SpacetimeDB connected:', identity.toHexString());
          conn.subscriptionBuilder().subscribeToAllTables();
        })
        .onDisconnect(() => {
          currentIdentity.set(null);
          console.log('SpacetimeDB disconnected');
        })
        .onConnectError((_ctx, err) => {
          console.error('SpacetimeDB connection error:', err);
        })
    ),
  ]
};
