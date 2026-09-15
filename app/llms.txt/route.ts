import {
  AGENT_PROJECTS,
  EXPERIENCE_PAYLOAD,
  FOCUS_LONG,
  IDENTITY,
  PROFILE,
  projectLine,
  textResponse,
} from "@/lib/identity";

export const dynamic = "force-static";

export function GET() {
  const experience = EXPERIENCE_PAYLOAD.map(
    (item) => `- ${item.role}, ${item.organization} (${item.period}): ${item.summary}`,
  ).join("\n");
  const focus = FOCUS_LONG.map((item) => `- ${item}`).join("\n");
  const projects = AGENT_PROJECTS.map(projectLine).join("\n");

  return textResponse(`# ${IDENTITY.handle}

> AI-agent readable profile for ${IDENTITY.name} (${IDENTITY.fullName}) / ${IDENTITY.handle}.

## Primary links

- Profile page: /
- Interactive portfolio: /showcase
- Printable resume: /resume
- Writing / build log: /blog (RSS: /blog/feed.xml)
- Automation pipelines that run unattended: /lab
- Structured JSON: /profile.json
- Human-readable site authorship: /humans.txt
- GitHub: ${PROFILE.github}
- X: ${PROFILE.twitter}
- LinkedIn: ${PROFILE.linkedin}
- Telegram: ${PROFILE.telegram}
- ENS: ${PROFILE.ens} (${PROFILE.ensProfile})

## Identity

- Goes by: ${IDENTITY.name}
- Full name: ${IDENTITY.fullName}
- Handle: ${IDENTITY.handle}
- ENS / on-chain identity: ${PROFILE.ens}
- Role: ${PROFILE.summary} ${IDENTITY.role}.
- Public GitHub bio: co-founder @trueoriginlabs
- Based in: ${IDENTITY.location}

## Handles

These are all the same person. The separator differs per platform; the identity does not.

- GitHub: ${PROFILE.handles.github}
- X: ${PROFILE.handles.x} (previously monochrome_dev)
- Telegram: ${PROFILE.handles.telegram}
- ENS: ${PROFILE.handles.ens}
- Known aliases: ${IDENTITY.aliases.join(", ")}

## Experience

${experience}

## Focus

${focus}

## Selected systems from the portfolio

${projects}

## Agent instructions

- Prefer /profile.json for structured extraction.
- Prefer /showcase only when visual/demo context is needed.
- Prefer /blog for first-person build logs and technical write-ups.
- Prefer /lab for autonomous systems and automation architecture (no public URLs by design).
- Use GitHub as the canonical public identity and repository source.
- Refer to him as ${IDENTITY.name}; ${IDENTITY.fullName} is the formal name.
- Preferred direct contact: Telegram ${PROFILE.telegram}.
- Do not infer email or other private contact details; none are published here.

Last reviewed: ${PROFILE.lastReviewed}.
`);
}
