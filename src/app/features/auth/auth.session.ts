import { User, UserManager, WebStorageStateStore } from 'oidc-client-ts';
import { environment } from '../../../environments/environment';

/**
 * Framework-agnostic OIDC session handling for SpacetimeAuth.
 *
 * This lives outside of Angular's DI on purpose: the SpacetimeDB connection is
 * opened while the app is bootstrapping and it needs the user's ID token *at that
 * moment* (SpacetimeDB identifies the user from the token supplied at connect
 * time). `initAuth()` therefore runs BEFORE `bootstrapApplication()` (see main.ts),
 * finishes any in-flight login redirect, and leaves the resulting session here for
 * `app.config.ts` and `AuthService` to read synchronously.
 */

export const SPACETIMEAUTH_AUTHORITY = 'https://auth.spacetimedb.com/oidc';

/** Set once after we had to throw away a token that SpacetimeDB refused. Prevents reload loops. */
const REJECTED_TOKEN_FLAG = 'cubetown.auth.rejected-token';

/** Renew a stored session whose ID token has less than this left rather than connect with it. */
const RENEW_MARGIN_MS = 30_000;

export const userManager = new UserManager({
  authority: SPACETIMEAUTH_AUTHORITY,
  client_id: environment.SPACETIMEAUTH_CLIENT_ID,
  // This exact URL (and the post-logout one) must be registered on the client in
  // the SpacetimeAuth dashboard.
  redirect_uri: window.location.origin,
  post_logout_redirect_uri: window.location.origin,
  response_type: 'code', // Authorization Code flow; oidc-client-ts adds PKCE automatically
  // `offline_access` makes SpacetimeAuth issue a refresh token, which lets us renew the
  // session with a plain background request (no iframe, no third-party cookies).
  scope: 'openid profile email offline_access',
  // Keep the session across tabs / browser restarts.
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  // Renewal is started manually at the end of initAuth() (see startSilentRenew below) so
  // it can't race with the refresh initAuth() may do itself for an already-expired session.
  automaticSilentRenew: false,
  // Only used as a fallback when no refresh token was issued: the renewal then runs in a
  // hidden iframe pointed at the app root, which main.ts recognises (see handleRenewalFrame).
  silent_redirect_uri: window.location.origin,
});

let session: User | null = null;

/** The logged-in user for this page load, or null when browsing as a guest. */
export function getSession(): User | null {
  return session;
}

/** The OIDC ID token that SpacetimeDB uses to identify the user, if logged in. */
export function getIdToken(): string | undefined {
  return session?.id_token;
}

/** True when this document is a hidden iframe loaded by oidc-client-ts for an iframe-based renewal. */
export function isRenewalFrame(): boolean {
  return window.parent !== window && isLoginCallback();
}

/** Hands the renewal response to the parent window. Call instead of bootstrapping the app. */
export async function handleRenewalFrame(): Promise<void> {
  await userManager.signinSilentCallback();
}

/** The ID token is what SpacetimeDB checks at connect time, so its own expiry matters too. */
function needsRenewal(user: User): boolean {
  const idTokenExp = typeof user.profile?.exp === 'number' ? user.profile.exp * 1000 : Infinity;
  return user.expired || idTokenExp - RENEW_MARGIN_MS <= Date.now();
}

function isLoginCallback(): boolean {
  const params = new URLSearchParams(window.location.search);
  return params.has('state') && (params.has('code') || params.has('error'));
}

/** Completes a login redirect (if we are in one) and loads the stored session. */
export async function initAuth(): Promise<User | null> {
  if (isLoginCallback()) {
    let returnUrl = '/';
    try {
      const user = await userManager.signinCallback();
      const state = user?.state as { returnUrl?: string } | undefined;
      if (state?.returnUrl?.startsWith('/')) returnUrl = state.returnUrl;
    } catch (err) {
      console.error('SpacetimeAuth login failed:', err);
    }
    // Drop ?code=...&state=... from the address bar before the router sees it.
    window.history.replaceState({}, document.title, returnUrl);
  }

  let user: User | null = null;
  try {
    user = await userManager.getUser();
    if (user && needsRenewal(user)) {
      // SpacetimeDB would reject an expired ID token. Renew it now (refresh token, or the
      // iframe fallback), and if that isn't possible treat the user as logged out.
      user = await userManager.signinSilent();
      if (!user || needsRenewal(user)) {
        await userManager.removeUser();
        user = null;
      }
    }
  } catch (err) {
    console.warn('Could not restore SpacetimeAuth session:', err);
    await userManager.removeUser().catch(() => undefined);
    user = null;
  }

  session = user;

  // From here on keep the stored session fresh while the app is open, so a later reload
  // (or reconnect) never starts from an expired token.
  userManager.events.addUserLoaded((renewed) => {
    session = renewed;
  });
  userManager.events.addSilentRenewError((err) => {
    console.warn('SpacetimeAuth silent renew failed:', err);
  });
  void userManager.startSilentRenew();

  return session;
}

export function login(): Promise<void> {
  const returnUrl = window.location.pathname + window.location.search;
  return userManager.signinRedirect({ state: { returnUrl } });
}

export async function logout(): Promise<void> {
  try {
    // Clears the local session and ends the SSO session at SpacetimeAuth.
    await userManager.signoutRedirect();
  } catch (err) {
    // e.g. the provider doesn't advertise an end_session_endpoint
    console.warn('Provider sign-out failed, clearing local session only:', err);
    await userManager.removeUser();
    window.location.assign('/');
  }
}

/** Called when SpacetimeDB accepted the connection: forget any earlier rejection. */
export function markTokenAccepted(): void {
  sessionStorage.removeItem(REJECTED_TOKEN_FLAG);
}

/**
 * Called when SpacetimeDB refused the token we connected with (typically because it
 * expired or was revoked). Discard the session and reload once to come back as a guest.
 */
export async function handleRejectedToken(): Promise<void> {
  if (!session || sessionStorage.getItem(REJECTED_TOKEN_FLAG)) return;
  sessionStorage.setItem(REJECTED_TOKEN_FLAG, '1');
  await userManager.removeUser();
  window.location.reload();
}
