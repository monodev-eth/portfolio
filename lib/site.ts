/* Canonical origin for absolute URLs (OG tags, RSS, sitemap, JSON-LD). The site
   lives on IPFS behind the monodev.eth ENS name, so that is the canonical home on
   every build, wherever the build runs. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://monodev.eth.limo";
