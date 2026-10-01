import { computed, inject, Injectable } from '@angular/core';
import { injectSpacetimeDB } from 'spacetimedb/angular';
import { getSession, login, logout } from './auth.session';

/**
 * Angular-facing view of the OIDC session.
 *
 * The session itself is resolved before the app bootstraps (see `initAuth()` in
 * auth.session.ts) and the SpacetimeDB connection is opened with the user's ID
 * token, so "am I logged in?" never changes during the lifetime of a page: login
 * and logout are full-page redirects through SpacetimeAuth.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly connection = injectSpacetimeDB();
  private readonly session = getSession();

  /** True when this page load is connected to SpacetimeDB as a logged-in user. */
  readonly isAuthenticated = this.session !== null;

  /** Claims from the ID token (name, email, ...). Display only: the server never trusts these from the client. */
  readonly profile = this.session?.profile ?? null;

  /** The user's SpacetimeDB identity, once connected. `undefined` for guests/while connecting. */
  readonly identity = computed(() => (this.session ? this.connection().identity : undefined));

  login(): Promise<void> {
    return login();
  }

  logout(): Promise<void> {
    return logout();
  }
}
