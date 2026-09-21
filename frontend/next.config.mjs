const configuredApiOrigin = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8070";
const apiOrigin = configuredApiOrigin.replace("//localhost:", "//127.0.0.1:");
const apiPrefix = process.env.NEXT_PUBLIC_API_PREFIX || "/cafe-kiaan/api";

const nextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "images.pexels.com" }
    ]
  },
  async rewrites() {
    return [
      {
        source: `${apiPrefix}/:path*`,
        destination: `${apiOrigin}${apiPrefix}/:path*`
      }
    ];
  }
};

export default nextConfig;
