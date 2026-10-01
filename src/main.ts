import { bootstrapApplication } from '@angular/platform-browser';
import { buildAppConfig } from './app/app.config';
import { App } from './app/app';
import { handleRenewalFrame, initAuth, isRenewalFrame } from './app/features/auth/auth.session';

async function main() {
  // When silent renewal falls back to a hidden iframe, the iframe loads this same app
  // with the renewal response in the URL. Pass it to the parent window and don't boot.
  if (isRenewalFrame()) {
    await handleRenewalFrame();
    return;
  }

  // Resolve the OIDC session first: the SpacetimeDB connection created during
  // bootstrap needs the user's ID token.
  await initAuth();
  await bootstrapApplication(App, buildAppConfig());
}

main().catch((err) => console.error(err));
