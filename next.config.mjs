/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: true
  },
  images: {
    domains: [
      'static.ticimax.cloud',
      'www.durmazz.com',
      'www.teknogold.com',
      'www.kibristeknoloji.com',
      'www.irismostore.com',
      'www.sharafstore.com',
      'www.fistikbilgisayar.com'
    ]
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': '/src'
    };
    return config;
  }
};

export default nextConfig;