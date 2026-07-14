/*
 * Pin the static export (./out) to Pinata as a browsable IPFS folder.
 * Uses the legacy pinFromFS path (free-plan compatible; the v3 CAR upload is
 * paid-only). Prints the CID and writes it to the GitHub Actions run summary.
 *
 * Env: PINATA_JWT_TOKEN (required), GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_STEP_SUMMARY
 */
const fs = require("fs");
const pinataSDK = require("@pinata/sdk");

async function main() {
  const jwt = process.env.PINATA_JWT_TOKEN;
  if (!jwt) {
    console.error("::error::Missing PINATA_JWT_TOKEN secret.");
    process.exit(1);
  }
  if (!fs.existsSync("out")) {
    console.error("::error::./out not found — did `npm run build` run?");
    process.exit(1);
  }

  const pinata = new pinataSDK({ pinataJWTKey: jwt });
  await pinata.testAuthentication();

  const repo = (process.env.GITHUB_REPOSITORY || "portfolio").replace(/\//g, "-");
  const sha = (process.env.GITHUB_SHA || "").slice(0, 7);
  const name = sha ? `${repo}-${sha}` : repo;

  const res = await pinata.pinFromFS("out", {
    pinataMetadata: { name },
    pinataOptions: { cidVersion: 1 },
  });

  const cid = res.IpfsHash;
  console.log(`Pinned "${name}" -> ${cid} (${res.PinSize} bytes)`);

  const summary = process.env.GITHUB_STEP_SUMMARY;
  if (summary) {
    fs.appendFileSync(
      summary,
      [
        "### 🌐 Pinned to IPFS via Pinata",
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
