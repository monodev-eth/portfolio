/*
 * The other surfaces of the site, rendered as chips in the showcase header so
 * they are reachable from the first frame instead of after ten projects.
 *
 * Deliberately not part of PROJECTS: that array feeds /, /llms.json,
 * /profile.json and the JSON-LD, and navigation is not a project.
 */
export interface Surface {
  id: string;
  /** Mark shown inside the chip. */
  logo: string;
  /** Chip label. Hidden on a phone, where the chip goes icon-only. */
  label: string;
  href: string;
  /** Title/aria text, so the icon-only chip still says where it goes. */
  hint: string;
}

export const SURFACES: Surface[] = [
  {
    id: "lab",
    logo: "/logos/lab.svg",
    label: "Lab",
    href: "/lab",
    hint: "Lab: four pipelines that run unattended",
  },
  {
    id: "writing",
    logo: "/logos/writing.svg",
    label: "Writing",
    href: "/blog",
    hint: "Writing: build logs from the bench",
  },
];
