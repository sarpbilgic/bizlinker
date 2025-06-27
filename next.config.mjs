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
      'www.fistikbilgisayar.com',
      'iet-cdn-007.akinsofteticaret.net',
      'cdn03.ciceksepeti.com',
      'dummyimage.com',
      'as6eaty9uqeg.merlincdn.net',
      'img-bizlinkerhub.mncdn.com'
    ],
    minimumCacheTTL: 60,
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