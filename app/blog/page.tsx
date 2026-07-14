import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";

const DESCRIPTION = `Build logs and field notes from ${PROFILE.displayName} (${PROFILE.name}): security, AI agents, automation, and whatever is currently on the bench.`;

export const metadata: Metadata = {
  title: `Writing / ${PROFILE.name}`,
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/blog`,
    types: { "application/rss+xml": `${SITE_URL}/blog/feed.xml` },
  },
  openGraph: {
    title: `Writing / ${PROFILE.name}`,
    description: DESCRIPTION,
    type: "website",
    url: `${SITE_URL}/blog`,
  },
};

export default function BlogIndex() {
  const posts = getAllPosts();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${PROFILE.displayName} — writing`,
    description: DESCRIPTION,
    url: `${SITE_URL}/blog`,
    author: { "@type": "Person", name: PROFILE.displayName, alternateName: PROFILE.name, url: SITE_URL },
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      datePublished: post.date,
      url: `${SITE_URL}/blog/${post.slug}`,
    })),
  };

  return (
    <main className="blogmain">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>Writing</h1>
      <p className="blogintro">
        Build logs from the bench: what got hacked together, what broke, and what shipped anyway.
      </p>
      {posts.length === 0 ? (
        <p className="blogempty">nothing published yet — first post loading…</p>
      ) : (
        <ol className="postlist">
          {posts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>
                <span className="postdate">{post.date}</span>
                <span>
                  <span className="posttitle">
                    {post.title}
                    {post.draft && <span className="draftflag">draft</span>}
                  </span>
                  {post.summary && <span className="postsummary">{post.summary}</span>}
                  {post.tags.length > 0 && <span className="posttags">{post.tags.join(" / ")}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </main>
  );
}
