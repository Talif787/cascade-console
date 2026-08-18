import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // The API base URL is read at request time by the server-side proxy, so it is
  // not baked into the client bundle. See lib/api/config.ts.
};

export default nextConfig;
