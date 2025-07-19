/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.livepeer.cloud",
        port: "",
        pathname: "/stream/**",
      },
      {
        protocol: "https",
        hostname: "obj-store.livepeer.cloud",
        port: "",
        pathname: "/livepeer-cloud-ai-images/**",
      },
    ],
  },
};

export default nextConfig;
