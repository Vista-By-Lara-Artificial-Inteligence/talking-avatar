// app/root.tsx
import * as React from "react";
import type { LinksFunction, HeadersFunction, MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

export const headers: HeadersFunction = () => {
  return {
    /**
     * Allow the Shopify Admin to frame the embedded app.
     * DO NOT set `X-Frame-Options: SAMEORIGIN` anywhere.
     */
    "Content-Security-Policy":
      "frame-ancestors https://*.myshopify.com https://admin.shopify.com;",
  };
};

export const meta: MetaFunction = () => ([
  { charSet: "utf-8" },
  { name: "viewport", content: "width=device-width, initial-scale=1" },
  { title: "AI Avatar Talking by Vista" },
]);

export const links: LinksFunction = () => [
  // Example: global stylesheet if you have one.
  // { rel: "stylesheet", href: styles },
];

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        {/* Your layout shell could go here if needed */}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
