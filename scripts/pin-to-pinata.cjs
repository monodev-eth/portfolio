/*
 * Pin the static export (./out) to Pinata as a browsable IPFS folder.
 *
 * Uploads the directory directly to the legacy pinFileToIPFS endpoint (free-plan
 * compatible — the v3 CAR upload is paid-only). Pinata requires a single top-level
 * directory, so every file is sent under one wrapper folder ("out/…"). Pinata pins
 * that directory and returns its CID, so the site root is the CID root:
 * <cid>/index.html is the homepage, which is what ENS contenthash needs.
 *
 * Env: PINATA_JWT_TOKEN (required to pin), GITHUB_REPOSITORY, GITHUB_SHA,
 *      GITHUB_STEP_SUMMARY. Set DRY_RUN=1 to walk + list files without uploading.
 */
const fs = require("fs");
const path = require("path");

const ROOT = "out";
const PIN_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(abs));
    else if (entry.isFile()) files.push(abs);
  }
  return files;
}

// posix path relative to ROOT, e.g. "blog/index.html"
const relPosix = (abs) => path.relative(ROOT, abs).split(path.sep).join("/");

async function verifyRoot(cid) {
  const url = `https://${cid}.ipfs.dweb.link/index.html`;
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(url, { redirect: "follow" });
      if (r.ok) {
        const body = await r.text();
        if (/<!doctype html/i.test(body) || body.includes("monodev")) return true;
      }
    } catch {
      /* propagation lag / transient — retry */
    }
    await new Promise((res) => setTimeout(res, 10000));
  }
  return false;
}

async function main() {
  if (!fs.existsSync(path.join(ROOT, "index.html"))) {
    console.error("::error::out/index.html missing — did `npm run build` run?");
    process.exit(1);
  }

  const files = walk(ROOT);
  console.log(`Found ${files.length} files under ./${ROOT}`);

  if (process.env.DRY_RUN) {
    for (const f of files.slice(0, 8)) console.log("  ", relPosix(f));
    console.log(`  … (${files.length} total, ${(files.reduce((n, f) => n + fs.statSync(f).size, 0) / 1048576).toFixed(1)} MB)`);
    return;
  }

  const jwt = process.env.PINATA_JWT_TOKEN;
  if (!jwt) {
    console.error("::error::Missing PINATA_JWT_TOKEN secret.");
    process.exit(1);
  }

  const form = new FormData();
  for (const abs of files) {
    // Single wrapper dir: Pinata rejects multiple top-level entries. The wrapper
    // name is not part of the returned path (CID == the wrapper dir itself).
    form.append("file", new Blob([fs.readFileSync(abs)]), `out/${relPosix(abs)}`);
  }
  form.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
  const repo = (process.env.GITHUB_REPOSITORY || "portfolio").replace(/\//g, "-");
  const sha = (process.env.GITHUB_SHA || "").slice(0, 7);
  form.append("pinataMetadata", JSON.stringify({ name: sha ? `${repo}-${sha}` : repo }));

  const res = await fetch(PIN_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    console.error(`::error::Pinata HTTP ${res.status}: ${text}`);
    process.exit(1);
  }
  const cid = JSON.parse(text).IpfsHash;
  console.log(`Pinned ${files.length} files -> ${cid}`);

  const verified = await verifyRoot(cid);
  console.log(verified ? "Verified <cid>/index.html serves the site." : "::warning::Could not confirm <cid>/index.html via public gateway yet (propagation lag) — verify before setting ENS.");

  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    fs.appendFileSync(
      summary,
      [
        "### 🌐 Pinned to IPFS via Pinata",
        "",
        verified ? "✅ Homepage verified at the CID root." : "⚠️ Homepage not yet confirmed via public gateway (propagation lag) — check the preview link before setting ENS.",
        "",
        "| | |",
        "|---|---|",
        `| **CID** | \`${cid}\` |`,
        `| **ENS Content Hash** | \`ipfs://${cid}\` |`,
        `| **Gateway preview** | https://${cid}.ipfs.dweb.link |`,
        "",
        "Set **monodev.eth** → Content Hash to the `ipfs://…` value above at https://app.ens.domains",
        "",
      ].join("\n") + "\n"
    );
  }
}

main().catch((err) => {
  console.error(`::error::Pinata pin failed: ${err && err.message ? err.message : err}`);
  process.exit(1);
});
