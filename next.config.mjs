/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even with ESLint errors
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'placehold.co',
      'images.unsplash.com',
      'i.pravatar.cc',
      'rmtqrojuwbwgsaaiaxcf.supabase.co' // tambahkan domain ini
    ],
  },
};

export default nextConfig;
