// src/index.js
// Entry for the ratehero Workers Static Assets project.
// Routes mobile visitors from the homepage to /mobile/ silently,
// then delegates everything else to the static asset server.

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const ua = (request.headers.get('user-agent') || '').toLowerCase();

    // 1. Explicit desktop override via ?desktop=1 or cookie
    const cookie = request.headers.get('cookie') || '';
    const hasDesktopCookie = /(?:^|;\s*)rh_desktop=1/.test(cookie);
    const hasDesktopParam = url.searchParams.get('desktop') === '1';

    if (hasDesktopCookie || hasDesktopParam) {
      const response = await env.ASSETS.fetch(request);
      if (hasDesktopParam) {
        const r = new Response(response.body, response);
        r.headers.append(
          'Set-Cookie',
          'rh_desktop=1; Path=/; Max-Age=2592000; SameSite=Lax'
        );
        return r;
      }
      return response;
    }

    // 2. Skip if already inside /mobile/ — no loops
    if (url.pathname === '/mobile' || url.pathname.startsWith('/mobile/')) {
      return env.ASSETS.fetch(request);
    }

    // 3. Only rewrite the homepage. Interior pages pass through as-is.
    if (url.pathname !== '/' && url.pathname !== '/index.html') {
      return env.ASSETS.fetch(request);
    }

    // 4. Skip bots so SEO keeps indexing desktop as canonical
    const isBot =
      /bot|crawler|spider|facebookexternalhit|slackbot|twitterbot|linkedinbot|whatsapp|telegram|discord|preview|lighthouse|pagespeed|gtmetrix/i.test(
        ua
      );
    if (isBot) {
      return env.ASSETS.fetch(request);
    }

    // 5. Mobile UA detection
    const isMobile =
      /iphone|ipod|android.*mobile|windows phone|blackberry|webos|opera mini|iemobile/i.test(
        ua
      );

    if (isMobile) {
      // Rewrite (not redirect) — address bar stays on goratehero.com
      const rewrittenUrl = new URL('/mobile/', url.origin);
      return env.ASSETS.fetch(new Request(rewrittenUrl.toString(), request));
    }

    // Desktop — serve normal homepage
    return env.ASSETS.fetch(request);
  }
};
