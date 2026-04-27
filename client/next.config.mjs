/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable React Compiler for stability (causes chunk loading issues)
  reactCompiler: false,
  
  // Optimize package imports to reduce bundle size
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
