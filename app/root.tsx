// app/root.tsx
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

export const headers = () => ({
  "Content-Security-Policy": [
    "default-src 'self'",
    "img-src 'self' data: blob: https: http:",
    "media-src 'self' data: blob: https: http:",
    "script-src 'self' 'unsafe-inline'", // Remix inline runtime
    "style-src 'self' 'unsafe-inline'",
    "connect-src 'self' https: http:",
    "frame-ancestors https://*.myshopify.com https://admin.shopify.com",
  ].join("; "),
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body style={{ margin: 0, fontFamily: "ui-sans-serif, system-ui" }}>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
