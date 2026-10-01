import type { JwtClaims } from 'spacetimedb/server';

/**
 * The only OIDC issuer / client we trust to identify a *user*.
 *
 * SpacetimeDB verifies the JWT signature for us, but it will happily accept a
 * validly signed token from ANY issuer (including other people's SpacetimeAuth
 * projects). Checking `iss` and `aud` here makes sure only tokens minted for
 * the CubeTown client are treated as logged-in users.
 *
 * The client id is public information (it is shipped in the Angular bundle).
 * Keep it in sync with `SPACETIMEAUTH_CLIENT_ID` in src/environments/environment.ts.
 */
export const SPACETIMEAUTH_ISSUER = 'https://auth.spacetimedb.com/oidc';
export const SPACETIMEAUTH_CLIENT_ID = 'client_033BJ43mVUGYtlElGy8LVQ';

export function isTrustedUserToken(claims: JwtClaims | null): claims is JwtClaims {
  return (
    claims !== null &&
    claims.issuer === SPACETIMEAUTH_ISSUER &&
    claims.audience.includes(SPACETIMEAUTH_CLIENT_ID)
  );
}

function claimAsString(claims: JwtClaims, key: string): string | undefined {
  const value = claims.fullPayload[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Best-effort initial display name taken from the (verified) token claims. */
export function displayNameFromClaims(claims: JwtClaims): string {
  const fromClaims =
    claimAsString(claims, 'preferred_username') ??
    claimAsString(claims, 'name') ??
    claimAsString(claims, 'email')?.split('@')[0];

  return (fromClaims ?? `Cuber-${claims.identity.toHexString().slice(0, 6)}`).slice(0, 32);
}
