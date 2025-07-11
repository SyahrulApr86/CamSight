/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: "standalone",
  images: {
    domains: [
      "localhost",
      process.env.BACKEND_HOST || "localhost",
      // Add additional domains for production
      "127.0.0.1",
      "0.0.0.0",
      "backend", // Docker service name
    ].filter(Boolean),
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
