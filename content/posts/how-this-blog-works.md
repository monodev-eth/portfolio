---
title: How this blog works
date: 2026-07-07
summary: Markdown files in a folder, zero database, everything rendered at build time. Notes on the setup and how to publish a post.
tags: meta, nextjs
---

This site now has a blog. The whole engine is a folder of markdown files that Next.js turns into static pages at build time. No CMS, no database, no admin panel. Publishing means committing a file.

## Publishing a post

Drop a markdown file into `content/posts/`. The filename becomes the URL, so `content/posts/my-post.md` ships as `/blog/my-post`. Each file starts with a small frontmatter block:

```md
---
title: My post
date: 2026-07-07
summary: One line shown on the index, in the RSS feed, and as the OG description.
tags: hardware, fpv
draft: true
---

Body starts here.
```

`draft: true` keeps a post visible in `next dev` but out of production builds, the RSS feed, and the sitemap. Delete the line when it is ready. Tags are comma separated and purely cosmetic for now.

Images live in `public/blog/` and are referenced the normal markdown way:

```md
![Bench photo](/blog/bench.jpg)
```

## What the build does

Every surface is statically generated:

- `/blog` lists the posts newest first
- `/blog/<slug>` renders the markdown with syntax highlighting (shiki, build time only, zero client JS)
- `/blog/feed.xml` is a plain RSS 2.0 feed
- `/sitemap.xml` covers the whole site including posts

Code blocks get highlighted from the fence language:

```ts
const posts = fs.readdirSync("content/posts").filter((f) => f.endsWith(".md"));
```

Each post page also carries `BlogPosting` JSON-LD and per-post OpenGraph tags, in keeping with the rest of the site being readable by agents as much as by people.

That is the whole system. The interesting posts come next.
