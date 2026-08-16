# ISKCON Kurnool website

## Local development

1. Install dependencies with `bun install --frozen-lockfile`.
2. Copy `.env.example` to `.env` and fill in the connected Lovable Cloud public values.
3. Run `bun run dev`.

The admin panel signs in through Lovable Cloud Auth. Do not store the admin password in environment variables or source code.

## Cloudflare deployment from GitHub

- Build command: `bun run build`
- Deploy command: `bunx wrangler deploy`
- The repository includes `bun.lock`; keep it committed for repeatable builds.
- Add every public and server variable listed in `.env.example` to the Cloudflare project settings for both Preview and Production.
- Never create a `VITE_` variable for a private key. Browser variables are public by design.

Admin edits are written directly by the authenticated browser session and protected by database row-level policies. They do not depend on the deployment domain, but the Cloudflare build must receive the three `VITE_SUPABASE_*` public variables or login and persistence cannot work.