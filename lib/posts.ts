import fs from "node:fs";
import path from "node:path";

/*
 * THE writing edit point — drop a markdown file into content/posts/ and it
 * ships as /blog/<filename>. Frontmatter is plain "key: value" lines:
 *
 *   ---
 *   title: Racing three.js against the PS2 boot ROM
 *   date: 2026-07-07
 *   summary: One-liner shown on the index, in the RSS feed, and as the OG description.
 *   tags: webgl, nostalgia
 *   draft: true        <- optional; visible in `next dev`, excluded from builds
 *   ---
 *
 * Images go in public/blog/ and are referenced as /blog/<name>.png.
 */

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  slug: string;
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  summary: string;
  tags: string[];
  draft: boolean;
}

export interface Post extends PostMeta {
  /** Raw markdown body with frontmatter stripped. */
  markdown: string;
}

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { meta: {}, body: raw };
  const meta: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    meta[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim();
  }
  return { meta, body: raw.slice(match[0].length) };
}

function readPost(file: string): Post {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const { meta, body } = parseFrontmatter(raw);
  return {
    slug,
    title: meta.title ?? slug,
    date: meta.date ?? "1970-01-01",
    summary: meta.summary ?? "",
    tags: meta.tags ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    draft: meta.draft === "true",
    markdown: body,
  };
}

/** All posts, newest first. Drafts are included only in `next dev`. */
export function getAllPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md"))
    .map(readPost)
    .filter((post) => !post.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

export function getPost(slug: string): Post | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}
