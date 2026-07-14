/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export → a plain out/ folder of HTML/JS/assets, pinnable to IPFS and
  // resolvable via the monodev.eth ENS contenthash (served at monodev.eth.limo).
  output: "export",
  // Emit each route as a folder with index.html so IPFS gateways resolve cleanly.
  trailingSlash: true,
  // No image optimizer exists on IPFS; serve images as-is (we use plain <img>).
  images: { unoptimized: true },
  // The WebGL boot + carousel are imperative; StrictMode's double-invoke would
  // double-init the three.js scene and boot timers in dev. Disable it.
  reactStrictMode: false,
  // Lint nits shouldn't block a deploy build; type-checking stays on.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
