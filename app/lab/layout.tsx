import Link from "next/link";
import { PROFILE } from "@/lib/profile";
/* The reading shell (fixed self-scrolling panel, scanlines, grid backdrop, head
 * and foot chrome) is defined once in blog.css and shared. globals.css locks
 * <html>/<body> scroll for the PS2 showcase, so every text surface has to bring
 * its own scroll container. lab.css only adds what is specific to /lab. */
import "../blog/blog.css";
import "./lab.css";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="blogshell">
      <div className="blogwrap labwrap">
        <header className="bloghead">
          <a className="blogid" href="/">
            <img src={PROFILE.avatar} alt="" width={40} height={40} />
            <span>
              <span className="blogname">{PROFILE.displayName}</span>
              <span className="bloghandle">{PROFILE.handle}</span>
            </span>
          </a>
          <nav className="blognav" aria-label="Site">
            <Link href="/lab" aria-current="true">
              Lab
            </Link>
            <Link href="/blog">Writing</Link>
            <a href="/showcase">Showcase</a>
          </nav>
        </header>
        {children}
        <footer className="blogfoot">
          <a href="/">index</a>
          <a href="/blog">writing</a>
          <a href="/llms.json">llms.json</a>
        </footer>
      </div>
    </div>
  );
}
