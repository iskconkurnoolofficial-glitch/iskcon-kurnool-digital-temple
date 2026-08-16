# Repair admin login and persistent saves

## Goal
Make the single admin login work reliably on localhost, Lovable-hosted links, and GitHub-to-Cloudflare deployments, and ensure every admin change remains after refresh.

## Changes
1. Replace browser-local “logged in” state with the real backend auth session and verify the account’s admin role before opening the panel.
2. Sign in with the admin account’s normal email/password flow. Keep the existing server-side magic-link flow only as a one-time compatibility bootstrap, then set the account password so future external deployments no longer require a privileged server key to sign in.
3. Remove plaintext admin credentials from local storage; restore sessions through the auth client’s persisted session instead.
4. Block successful UI login when session exchange or role verification fails, and show actionable save/login errors instead of silently continuing.
5. Make content setters report persistence failures and prevent stale realtime echoes from hiding failed writes.
6. Add safe public deployment variables/configuration needed by GitHub and Cloudflare builds; document the remaining Cloudflare build/deploy commands without committing private keys.
7. Verify the flow end to end: login, edit a reversible content value, reload, confirm persistence, restore the value, and check browser/server errors.

## Technical details
- Keep row-level database protections and the existing `user_roles` admin record authoritative.
- Never expose or commit the privileged backend key.
- Use the existing browser backend client for authenticated writes so the same code works across domains.
