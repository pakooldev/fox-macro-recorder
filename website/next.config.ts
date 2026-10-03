import type { NextConfig } from "next";

// Static export: Cloudflare Pages just serves `out/` as files.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
