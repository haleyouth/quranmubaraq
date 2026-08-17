/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  /*
   * Static export. Every route in this site prerenders, so there is no need
   * for a server — which keeps the project on Firebase's free Spark plan
   * (framework hosting would otherwise require Cloud Functions and Blaze).
   *
   * If a genuinely dynamic route is added later, remove `output` and switch
   * firebase.json back to `"source": "."` with frameworksBackend.
   */
  output: "export",

  // The export target has no image optimization server.
  images: {
    unoptimized: true,
  },

  // Emit /about-us/index.html so static hosts resolve clean URLs.
  trailingSlash: true,
};

export default nextConfig;
