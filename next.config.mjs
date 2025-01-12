/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ebkecycctwtfnqsihdzh.supabase.co'
            },{
                protocol: 'https',
                hostname: 'knetic.org.uk'
            },
        ]
    }
};

export default nextConfig;