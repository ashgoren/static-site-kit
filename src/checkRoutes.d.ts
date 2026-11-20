import type { NextConfig } from "next";

/**
 * Wraps a site's next.config so app/ page folders are checked against site.config.ts links
 * during `next dev` and `next build`. See checkRoutes.js for the full rules.
 */
export function withRouteCheck(links: { href: string }[], nextConfig: NextConfig): (phase: string) => NextConfig;
