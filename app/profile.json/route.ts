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
    name: IDENTITY.name,
    fullName: IDENTITY.fullName,
    handle: IDENTITY.handle,
    aliases: IDENTITY.aliases,
    role: IDENTITY.role,
    summary: IDENTITY.summary,
    location: IDENTITY.location,
    avatar: IDENTITY.avatar,
    ens: IDENTITY.ens,
    links: {
      ...SOCIAL_LINKS,
      interactivePortfolio: "/showcase",
      resume: "/resume",
      blog: "/blog",
      lab: "/lab",
      llms: "/llms.json",
    },
    focus: [...PROFILE.focus],
    experience: EXPERIENCE_PAYLOAD,
    projects: AGENT_PROJECTS,
    lastReviewed: PROFILE.lastReviewed,
  });
}
