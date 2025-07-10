/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    domains: ["localhost"],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `http://${
          process.env.BACKEND_HOST || "localhost"
        }:8000/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
