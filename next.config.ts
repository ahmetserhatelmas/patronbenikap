import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Shared hosting / PM2: smaller self-contained server bundle
  output: "standalone",
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "radix-ui", "date-fns"],
  },
};

export default nextConfig;
