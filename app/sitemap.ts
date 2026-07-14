import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

// Prerender to a static sitemap.xml file for the IPFS/ENS export.
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts()
    .filter((post) => !post.draft)
    .map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.date,
    }));
  return [
    { url: SITE_URL },
    { url: `${SITE_URL}/showcase` },
    { url: `${SITE_URL}/blog` },
    ...posts,
  ];
}
