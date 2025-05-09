// Add this to your existing next.config.mjs
const nextConfig = {
  // ... your existing config
  
  // Add this option to ignore TypeScript errors during build
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;