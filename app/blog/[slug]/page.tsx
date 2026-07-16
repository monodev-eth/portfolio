import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { renderMarkdown } from "@/lib/markdown";
import { getAllPosts, getPost } from "@/lib/posts";
import { PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";

/* Every post is rendered at build time; unknown slugs 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: `${post.title} / ${PROFILE.name}`,
    description: post.summary,
    alternates: { canonical: `${SITE_URL}/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
      authors: [PROFILE.displayName],
      tags: post.tags,
      url: `${SITE_URL}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.summary,
    },
  };
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const html = await renderMarkdown(post.markdown);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    keywords: post.tags.join(", "),
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    isPartOf: { "@type": "Blog", name: `${PROFILE.displayName} — writing`, url: `${SITE_URL}/blog` },
    author: {
      "@type": "Person",
      name: PROFILE.displayName,
      alternateName: PROFILE.name,
      url: SITE_URL,
      sameAs: [PROFILE.github, PROFILE.twitter, PROFILE.linkedin, PROFILE.telegram, PROFILE.ensProfile],
    },
  };

  return (
    <main className="blogmain">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article>
        <header className="postmeta">
          <p className="postdate">
            {post.date}
            {post.tags.length > 0 && ` · ${post.tags.join(" / ")}`}
            {post.draft && <span className="draftflag">draft</span>}
          </p>
          <h1>{post.title}</h1>
          {post.summary && <p className="postlede">{post.summary}</p>}
        </header>
        <div className="postbody" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
      <p className="backlink">
        <Link href="/blog">← all posts</Link>
      </p>
    </main>
  );
}
