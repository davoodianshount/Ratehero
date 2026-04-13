# Bolt — AI Mortgage Assistant
## Complete Deployment Guide for goratehero.com (Cloudflare)

---

## What's in this package

| File | Purpose |
|------|---------|
| `cloudflare-worker.js` | Serverless proxy — hides your API key, handles CORS |
| `bolt-widget.js` | Floating chat widget — drop into any page |
| `bolt-section.html` | "Meet Bolt" homepage section — goes after hard money banner |

---

## Step 1 — Get your Anthropic API key
1. Go to https://console.anthropic.com
2. Create an account / sign in
3. Go to API Keys → Create Key
4. Copy it — you'll need it in Step 2

---

## Step 2 — Deploy the Cloudflare Worker

```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create worker
wrangler init bolt-proxy
# Replace the generated worker.js with cloudflare-worker.js contents

# Add your API key as a secret (never hardcode it)
wrangler secret put ANTHROPIC_API_KEY
# Paste your key when prompted

# Deploy
wrangler deploy
```

Your Worker URL will be something like:
`https://bolt-proxy.YOUR_SUBDOMAIN.workers.dev`

---

## Step 3 — Update bolt-widget.js

Open `bolt-widget.js` and replace line 8:
```js
const WORKER_URL = 'https://bolt-proxy.YOUR_SUBDOMAIN.workers.dev';
```
with your actual Worker URL from Step 2.

---

## Step 4 — Add to goratehero.com

### The floating widget (every page)
Add before `</body>` on every page:
```html
<script src="/js/bolt-widget.js"></script>
```

### The Meet Bolt section (homepage only)
Paste `bolt-section.html` contents directly after the "Get Out of Hard Money" banner in your homepage HTML.

The section CTA button already wires up to the floating widget:
```html
onclick="document.getElementById('bolt-fab').click()"
```

### The hero text link
Under "Find My Ideal Loan →" button, add:
```html
<p style="font-size:13px;color:#475569;margin-top:8px;">
  Not sure? <span onclick="document.getElementById('bolt-fab').click()" 
  style="color:#3B82F6;font-weight:600;cursor:pointer;text-decoration:underline;
  text-underline-offset:3px;">Ask Bolt ⚡</span>
</p>
```

---

## Step 5 — Test it

1. Open goratehero.com
2. Click the ⚡ button bottom-right
3. Ask: "Can I exit a hard money loan in 21 days?"
4. Should get a real Bolt answer (not an error)

---

## Updating Bolt's knowledge

Bolt's knowledge lives in the `SYSTEM_PROMPT` string inside `cloudflare-worker.js`.

To update it:
1. Edit the SYSTEM_PROMPT in cloudflare-worker.js
2. Run `wrangler deploy` again
3. Live immediately — no site changes needed

---

## Costs

- Cloudflare Workers: Free tier covers 100,000 requests/day
- Anthropic API: ~$0.003 per conversation (fractions of a cent)
- A busy day of 500 Bolt conversations ≈ $1.50

---

## Placement summary

```
[Hero — Your Income. Your Rules. Our Rates.]
  → Find My Ideal Loan button
  → Not sure? Ask Bolt ⚡ (text link)

[BiggerPockets + Stats]

[Get Out of Hard Money banner]

[Meet Bolt section]  ← bolt-section.html goes here

[Find Your Path — situation selector]

[Loan Programs]
...

[⚡ Bolt floating button — bottom right, every page]
```
