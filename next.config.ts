import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  distDir: process.env.SILVA_TEST_FRONTEND === "true" ? ".next-commerce-test" : ".next",
};

export default nextConfig;
