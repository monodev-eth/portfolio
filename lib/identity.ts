/*
 * Derives the agent-readable payloads from the identity + project sources.
 *
 * /profile.json, /llms.json, /llms.txt and /humans.txt are all built from this
 * module, so the four surfaces cannot drift apart the way hand-maintained
 * copies did. Edit lib/profile.ts or lib/projects.ts — never a payload here.
 */
import { PROFILE, EXPERIENCE, FOCUS_LONG } from "@/lib/profile";
import { PROJECTS, type Project } from "@/lib/projects";

/** The project source calls the documentation link `study`; agents expect `docs`. */
function agentLinks(project: Project): Record<string, string> {
  const links: Record<string, string> = {};
  if (project.links.live) links.live = project.links.live;
  if (project.links.app) links.app = project.links.app;
  if (project.links.study) links.docs = project.links.study;
  if (project.links.code) links.code = project.links.code;
  return links;
}

export const AGENT_PROJECTS = PROJECTS.map((project) => {
  const links = agentLinks(project);
  return {
    name: project.title,
    summary: project.summary,
    result: project.result,
    stack: [...project.stack],
    ...(Object.keys(links).length ? { links } : {}),
  };
});

export const SOCIAL_LINKS = {
  github: PROFILE.github,
  x: PROFILE.twitter,
  linkedin: PROFILE.linkedin,
  telegram: PROFILE.telegram,
  ens: PROFILE.ensProfile,
} as const;

export const IDENTITY = {
  name: PROFILE.displayName,
  fullName: PROFILE.fullName,
  handle: PROFILE.name,
  aliases: [...PROFILE.aliases],
  role: PROFILE.roleLong,
  summary: PROFILE.summary,
  location: PROFILE.location,
  avatar: PROFILE.avatar,
  ens: PROFILE.ens,
  email: PROFILE.email,
} as const;

export const EXPERIENCE_PAYLOAD = EXPERIENCE.map((item) => ({
  role: item.role,
  organization: item.organization,
  period: item.period,
  summary: item.summary,
}));

/** "- Name: summary Live: url. Docs: url." — one bullet per project for llms.txt. */
export function projectLine(project: (typeof AGENT_PROJECTS)[number]): string {
  const labels: Record<string, string> = { live: "Live", app: "App", docs: "Docs", code: "Code" };
  const links = Object.entries(project.links ?? {})
    .map(([key, url]) => ` ${labels[key] ?? key}: ${url}.`)
    .join("");
  /* `result` is a separate field in the JSON payloads; inlining it here too
   * just repeats the same numbers the summary already carries. */
  return `- ${project.name}: ${project.summary}${links}`;
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

export function jsonResponse(payload: unknown): Response {
  return new Response(`${JSON.stringify(payload, null, 2)}\n`, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

export { PROFILE, FOCUS_LONG };
