import {
  AGENT_PROJECTS,
  EXPERIENCE_PAYLOAD,
  IDENTITY,
  PROFILE,
  SOCIAL_LINKS,
  jsonResponse,
} from "@/lib/identity";

export const dynamic = "force-static";

export function GET() {
  return jsonResponse({
    name: IDENTITY.handle,
    displayName: IDENTITY.name,
    fullName: IDENTITY.fullName,
    aliases: IDENTITY.aliases,
    role: IDENTITY.role,
    summary: IDENTITY.summary,
    location: IDENTITY.location,
    email: IDENTITY.email,
    links: {
      site: "/",
      showcase: "/showcase",
      resume: "/resume",
      blog: "/blog",
      lab: "/lab",
      rss: "/blog/feed.xml",
      ...SOCIAL_LINKS,
      profile: "/profile.json",
    },
    focus: [...PROFILE.focus],
    experience: EXPERIENCE_PAYLOAD,
    projects: AGENT_PROJECTS,
    lastReviewed: PROFILE.lastReviewed,
  });
}
