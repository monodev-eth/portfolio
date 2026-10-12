import { ImageResponse } from "next/og";
import { PROFILE } from "@/lib/profile";
import { SITE_URL } from "@/lib/site";

/*
 * The 1200x630 social card for every surface that has no image of its own.
 * Rendered once at build time from the identity source, so a role or summary
 * change updates the card too.
 */
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "84px 96px",
          color: "#f3f6ff",
          background:
            "radial-gradient(900px 420px at 50% -120px, rgba(42,79,180,.5), transparent 70%), linear-gradient(180deg, #080b18 0%, #060711 45%, #04050b 100%)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 120, lineHeight: 1.05 }}>{PROFILE.displayName}</div>
          <div style={{ marginTop: 14, fontSize: 44, color: "#b2bce2" }}>{PROFILE.roleLong}</div>
          <div style={{ marginTop: 36, maxWidth: 940, fontSize: 28, lineHeight: 1.5, color: "#929fc4" }}>{PROFILE.proof}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#76e4f4" }}>
          <span>{SITE_URL.replace(/^https?:\/\//, "")}</span>
          <span style={{ color: "#929fc4" }}>{PROFILE.ens}</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
