import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { DbConnection } from '../module_bindings';
import { provideSpacetimeDB } from 'spacetimedb/angular';
import { getIdToken, handleRejectedToken, markTokenAccepted } from './features/auth/auth.session';

const HOST = environment.SPACETIMEDB_HOST;
const DB_NAME = environment.SPACETIMEDB_DB_NAME;

/**
 * Must be called after `initAuth()` has resolved (see main.ts) so that the
 * SpacetimeAuth ID token, if there is one, is available when the SpacetimeDB
 * connection is built.
 *
 * Logged in  -> connect with the ID token; SpacetimeDB derives a stable identity from it.
 * Logged out -> connect anonymously (read-only guest, throwaway identity).
 */
export function buildAppConfig(): ApplicationConfig {
  const idToken = getIdToken();

  return {
    providers: [
      provideBrowserGlobalErrorListeners(),
      provideZoneChangeDetection({ eventCoalescing: true }),
      provideRouter(routes),

      provideSpacetimeDB(
        DbConnection.builder()
          .withUri(HOST)
          .withDatabaseName(DB_NAME)
          .withToken(idToken)
          .onConnect((conn, identity) => {
            markTokenAccepted();
            console.log(
              `SpacetimeDB connected as ${idToken ? 'user' : 'guest'}:`,
              identity.toHexString()
            );
            conn.subscriptionBuilder().subscribeToAllTables();
          })
          .onDisconnect(() => {
            console.log('SpacetimeDB disconnected');
          })
          .onConnectError((_ctx, err) => {
            console.error('SpacetimeDB connection error:', err);
            if (idToken) void handleRejectedToken();
          })
      ),
    ]
  };
}
