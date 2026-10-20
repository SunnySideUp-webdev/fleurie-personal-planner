import type { NextConfig } from "next";

const isStaticExport =
  process.env.FLEURIE_STATIC_EXPORT === "true" || process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1];
const basePath = isStaticExport && repositoryName ? `/${repositoryName}` : "";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: isStaticExport,
  basePath: basePath || undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: isStaticExport,
  },
};

export default nextConfig;
