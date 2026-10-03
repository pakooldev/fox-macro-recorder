import type { NextConfig } from "next";

// Static export: Cloudflare Pages just serves `out/` as files.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  // the extension folder above has its own package-lock.json: pin the app root here
  turbopack: { root: __dirname },
};

export default nextConfig;
