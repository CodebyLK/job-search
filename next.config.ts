import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    // This explicitly tells Turbopack to leave Prisma alone and use the standard Node version
    serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
