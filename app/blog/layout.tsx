import ReadingHeader from "@/components/ReadingHeader";
import "./blog.css";

/* The root route (/) is a hand-rolled route handler, so cross-surface links
 * use plain anchors; only blog-internal navigation goes through <Link>. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blogshell">
      <div className="blogwrap">
        <ReadingHeader current="writing" />
        {children}
        <footer className="blogfoot">
          <a href="/">Home</a>
          <a href="/resume">Résumé</a>
          <a href="/blog/feed.xml">RSS</a>
          <a href="/llms.json">llms.json</a>
        </footer>
      </div>
    </div>
  );
}
