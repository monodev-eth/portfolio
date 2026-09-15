import Link from "next/link";
import { PROFILE } from "@/lib/profile";
import { SURFACES } from "@/lib/surfaces";

export default function ReadingHeader({ current }: { current: "lab" | "writing" }) {
  return (
    <header className="bloghead">
      <a className="blogid" href="/" aria-label={`${PROFILE.displayName}, home`}>
        <img src={PROFILE.avatar} alt="" width={40} height={40} />
        <span>
          <span className="blogname">{PROFILE.displayName}</span>
          <span className="bloghandle">{PROFILE.handle}</span>
        </span>
      </a>
      <nav className="blognav" aria-label="Site">
        <a href="/showcase">Showcase</a>
        {SURFACES.map((surface) => (
          <Link key={surface.id} href={surface.href} aria-current={current === surface.id ? "page" : undefined}>
            {surface.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
