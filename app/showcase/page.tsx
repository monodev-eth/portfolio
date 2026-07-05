import type { Metadata } from "next";
import Dashboard from "@/components/Dashboard";
import { PROJECTS } from "@/lib/projects";
import { PROFILE } from "@/lib/profile";

export const metadata: Metadata = {
  title: `${PROFILE.name} - PS2 Portfolio Showcase`,
  description: "Interactive PlayStation 2 styled portfolio showcase for monodev-eth.",
};

// Server component: project content is passed in so it renders into the initial
// HTML, while all interactivity + WebGL live in the client <Dashboard/>.
export default function Showcase() {
  return <Dashboard projects={PROJECTS} />;
}
