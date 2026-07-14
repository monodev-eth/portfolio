import { getAllPosts } from "@/lib/posts";
import { PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const posts = getAllPosts().filter((post) => !post.draft);
  const items = posts
    .map((post) => {
      const url = `${SITE_URL}/blog/${post.slug}`;
      return (
        `<item>` +
        `<title>${esc(post.title)}</title>` +
        `<link>${esc(url)}</link>` +
        `<guid isPermaLink="true">${esc(url)}</guid>` +
        `<pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>` +
        `<description>${esc(post.summary)}</description>` +
        post.tags.map((tag) => `<category>${esc(tag)}</category>`).join("") +
        `</item>`
      );
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(`${PROFILE.displayName} — writing`)}</title>
<link>${esc(`${SITE_URL}/blog`)}</link>
<atom:link href="${esc(`${SITE_URL}/blog/feed.xml`)}" rel="self" type="application/rss+xml"/>
<description>${esc(`Build logs and field notes from ${PROFILE.displayName} (${PROFILE.name}).`)}</description>
<language>en</language>
${items}
</channel>
</rss>`;

  return new Response(xml, {
    headers: { "content-type": "application/rss+xml; charset=utf-8" },
  });
}
