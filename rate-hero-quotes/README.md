# rate-hero-quotes

Loan Quote Comparison worker for Rate Hero. Lives entirely under its own
hostnames — **does not touch** the main `goratehero.com` Pages site or the
other workers in this repo (`bolt-admin`, `bolt-proxy`, `ratehero`).

## What it serves

| Host                          | What                                            |
| ----------------------------- | ----------------------------------------------- |
| `quotes.goratehero.com`       | Admin panel + JSON API at `/admin/api/*`        |
| `{slug}.goratehero.com`       | Branded client-facing comparison page           |

A "slug" is `firstname + last-initial`, lowercase, alphanumeric only — e.g.
Anthony Guastella → `anthonyg.goratehero.com`. If the slug already exists in
KV, a number is appended (`anthonyg2`, `anthonyg3`, …).

If a subdomain has no matching quote in KV, the worker redirects to
`https://goratehero.com/` rather than 404ing — so `www.`, `mail.`, etc. keep
working through their own DNS.

## Deployment (one-time)

Run these from `rate-hero-quotes/`. Wrangler must be authenticated for the
`goratehero.com` Cloudflare account (`wrangler login` first).

### 1. Create the KV namespace

```bash
cd rate-hero-quotes
wrangler kv namespace create QUOTES
```

Copy the returned `id` into `wrangler.jsonc` (replace
`REPLACE_WITH_KV_ID_AFTER_CREATION`).

### 2. Deploy the worker

```bash
wrangler deploy
```

### 3. Set the admin access code

Pick a strong code (this is Sean's master login). Set it as a secret:

```bash
wrangler secret put ADMIN_CODE
# paste the code when prompted
```

### 4. Add custom domain routes (Cloudflare dashboard)

The `routes` block in `wrangler.jsonc` already declares both routes, but the
zone needs DNS records that point at the worker. In the Cloudflare dashboard
for `goratehero.com`:

1. **DNS → Records → Add record**
   - Type: `AAAA`, Name: `quotes`, IPv6: `100::`, Proxy: **on** (orange cloud)
   - Type: `AAAA`, Name: `*`, IPv6: `100::`, Proxy: **on**
   (Cloudflare uses `100::` as a "this hostname has no origin, route through
   workers" placeholder. Any proxied record works — the worker route catches
   the request before it reaches the origin.)
2. **Workers Routes** under the zone — verify the two entries from
   `wrangler.jsonc` appear:
   - `quotes.goratehero.com/*` → `rate-hero-quotes`
   - `*.goratehero.com/*` → `rate-hero-quotes`

   If the wildcard DNS record (`*`) already existed for some other reason
   (e.g. email subdomains), only add a custom subdomain `A`/`CNAME` for that
   specific name to bypass the wildcard.

> **Heads up — wildcard scope:** `*.goratehero.com/*` matches any subdomain
> that doesn't have a more specific DNS record. The worker handles this
> gracefully (no-KV-match → redirect to apex), but if you ever add a new
> subdomain that points at a different service, give it its own explicit DNS
> record so it's not eaten by the wildcard route.
>
> The bare apex (`goratehero.com/*`) is NOT covered by `*.goratehero.com/*`
> in Cloudflare — Pages keeps serving the main site untouched. The
> `bolt-admin` worker at `goratehero.com/admin*` is also unaffected.

### 5. First login

1. Go to `https://quotes.goratehero.com/admin`.
2. Enter the `ADMIN_CODE` you set in step 3.
3. Open the **Team** tab and add the three LOs:
   - Zack Kirakosyan
   - Oscar Espinoza
   - Sam Davoodian
4. Copy each generated access code and share it with the LO.

## Updating the worker

```bash
cd rate-hero-quotes
wrangler deploy
```

Logs:

```bash
wrangler tail
```

## Files

- `wrangler.jsonc` — worker config, routes, KV binding.
- `src/worker.js` — single-file worker: routing, KV access, admin HTML/JS,
  client-facing quote page HTML.
