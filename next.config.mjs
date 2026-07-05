/** @type {import('next').NextConfig} */
const nextConfig = {
  // The WebGL boot + carousel are imperative; StrictMode's double-invoke would
  // double-init the three.js scene and boot timers in dev. Disable it.
  reactStrictMode: false,
  // Lint nits shouldn't block a deploy build; type-checking stays on.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
