import Link from "next/link";
import { PROFILE } from "@/lib/profile";
import "./blog.css";

/* The root route (/) is a hand-rolled route handler, so cross-surface links
 * use plain anchors; only blog-internal navigation goes through <Link>. */
export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blogshell">
      <div className="blogwrap">
        <header className="bloghead">
          <a className="blogid" href="/">
            <img src={PROFILE.avatar} alt="" width={40} height={40} />
            <span>
              <span className="blogname">{PROFILE.displayName}</span>
              <span className="bloghandle">{PROFILE.handle}</span>
            </span>
          </a>
          <nav className="blognav" aria-label="Site">
            <Link href="/blog">Writing</Link>
            <a href="/showcase">Showcase</a>
            <a href="/blog/feed.xml">RSS</a>
          </nav>
        </header>
        {children}
        <footer className="blogfoot">
          <a href="/">index</a>
          <a href="/blog/feed.xml">feed.xml</a>
          <a href="/llms.json">llms.json</a>
        </footer>
      </div>
    </div>
  );
}
