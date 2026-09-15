import ReadingHeader from "@/components/ReadingHeader";
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
        <ReadingHeader current="lab" />
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
