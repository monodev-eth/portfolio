/* Canonical origin for absolute URLs (OG tags, RSS, sitemap, JSON-LD). */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "https://monodev.eth.limo");
