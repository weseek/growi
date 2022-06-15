/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    tsconfigPath: 'tsconfig.build.client.json',
  },
};

module.exports = nextConfig;
