/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    experimental: {
        missingSuspenseWithCSRBailout: false,
    },
};
export default nextConfig;
