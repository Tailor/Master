/** @type {import('next').NextConfig} */
const nextConfig = {
  // The backend is a separate MasterController service. The api() helper in
  // app/lib/api.ts talks to it via NEXT_PUBLIC_API_URL; CORS is configured on
  // the backend. Add rewrites/redirects here if you prefer same-origin proxying.
};

export default nextConfig;
