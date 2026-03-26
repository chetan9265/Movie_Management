// Firebase Storage domain whitelist
/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['192.168.43.151'],
  images: {
    domains: ["res.cloudinary.com"],
  },
};

module.exports = nextConfig;