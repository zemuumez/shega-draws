/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep verification builds separate when the development server is running.
  distDir: process.env.RIMNA_BUILD_DIR || ".next",
  compiler: {
    styledComponents: true,
  },

  // ─── Security Headers ───────────────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://*.sanity.io https://telegram.org https://*.telegram.org https://www.google.com/recaptcha/ https://www.gstatic.com/recaptcha/ https://apis.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              "font-src 'self' https://fonts.gstatic.com data:",
              "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io https://avatars.githubusercontent.com https://lh3.googleusercontent.com https://*.googleusercontent.com https://*.telegram.org https://t.me https://api.dicebear.com",
              `connect-src 'self' ${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"} https://*.sanity.io https://*.sanity.work https://*.sanity.dev https://api.sanity.io https://auth.sanity.io wss://*.sanity.io https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://www.google.com/recaptcha/ https://api.telegram.org https://oauth.telegram.org`,
              "frame-src 'self' https://*.sanity.io https://auth.sanity.io https://oauth.telegram.org https://telegram.org https://www.google.com/recaptcha/ https://recaptcha.google.com/recaptcha/ https://accounts.google.com",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io" },
    ],
  },
};

export default nextConfig;
