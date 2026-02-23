import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ai-olympics/ui", "@ai-olympics/shared"],
};

export default nextConfig;
