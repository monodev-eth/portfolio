import { IDENTITY, PROFILE, textResponse } from "@/lib/identity";

export const dynamic = "force-static";

export function GET() {
  return textResponse(`/* TEAM */

Name: ${IDENTITY.name}
Full name: ${IDENTITY.fullName}
Handle: ${IDENTITY.handle}
GitHub: ${PROFILE.github}
X: ${PROFILE.twitter}
LinkedIn: ${PROFILE.linkedin}
Telegram: ${PROFILE.telegram}
ENS: ${PROFILE.ens}
Role: ${IDENTITY.role}
Location: ${IDENTITY.location}

/* SITE */

Purpose: Lightweight identity and portfolio index for humans, AI agents, crawlers, and tools.
Interactive showcase: /showcase
Running systems: /lab
Printable resume: /resume
Agent profile: /llms.txt
Structured profile: /profile.json
Style: Clean PS2-inspired interface, semantic HTML first.

Last reviewed: ${PROFILE.lastReviewed}
`);
}
