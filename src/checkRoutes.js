// Plain JS (not TS) because this runs while Next.js loads a consuming site's next.config.ts,
// before any of the site's compilation happens, and Node won't strip types from .ts files
// inside node_modules. Types for this are in checkRoutes.d.ts.
//
// Exposed as its own entry point ("static-site-kit/check-routes") rather than from the
// package root, so next.config.ts doesn't pull in the React components, and so this
// node:fs doesn't end up in the browser bundle.

import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants.js";

const PAGE_FILES = ["page.tsx", "page.ts", "page.jsx", "page.js", "page.mdx"];

/**
 * Wraps a site's next.config so checkRoutes runs during `next dev` and `next build` only.
 * next.config may export a function of the current phase instead of a plain object; this
 * returns that function, handing back the site's config unchanged in every phase. The
 * deployed site has no app/ folder to read, so the check is skipped outside dev and build.
 *
 * @param {{ href: string }[]} links
 * @param {import("next").NextConfig} nextConfig
 * @returns {(phase: string) => import("next").NextConfig}
 */
export function withRouteCheck(links, nextConfig) {
  return (phase) => {
    if (phase === PHASE_DEVELOPMENT_SERVER || phase === PHASE_PRODUCTION_BUILD) checkRoutes(links);
    return nextConfig;
  };
}

/**
 * Throws if the published routes in app/ and the internal links in site.config.ts disagree,
 * so a mismatch stops `next dev` from starting and fails `next build` (and therefore the
 * Vercel deploy) instead of shipping.
 *
 * - A top-level app/ folder with a page file is a published route and must appear in links.
 *   Folders prefixed with `_` are Next.js private folders: never routed, so never checked.
 *   That's how a page is kept unpublished without deleting it.
 * - Every internal link (other than "/") must have a matching page folder, so the nav
 *   can't point at a page that's been made private or removed.
 *
 * Folders without a page file (components/, actions/, etc.) aren't routes and are ignored.
 * 
 * Note that only top-level routes are checked, since the sites using this don't include
 * nested routes, route groups, or dynamic segments.
 *
 * @param {{ href: string }[]} links
 * @param {string} [appDir] defaults to ./app under the current working directory, which is
 *   the project root whenever Next runs dev or build
 */
function checkRoutes(links, appDir = join(process.cwd(), "app")) {
  const pageRoutes = readdirSync(appDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("_"))
    .filter((entry) => PAGE_FILES.some((file) => existsSync(join(appDir, entry.name, file))))
    .map((entry) => `/${entry.name}`);

  // External links (https://...) aren't routes in this site, and "/" is always app/page.tsx
  const linkedRoutes = links
    .map(({ href }) => href)
    .filter((href) => href.startsWith("/") && href !== "/");

  const problems = [
    ...pageRoutes
      .filter((route) => !linkedRoutes.includes(route))
      .map(
        (route) =>
          `app${route}/ has a page but "${route}" isn't in links. Add it to links in site.config.ts to publish it, or rename the folder to app/_${route.slice(1)}/ to keep it unpublished.`
      ),
    ...linkedRoutes
      .filter((href) => !pageRoutes.includes(href))
      .map(
        (href) =>
          `links includes "${href}" but there's no app${href}/page.tsx. Is the folder still named app/_${href.slice(1)}/?`
      ),
  ];

  if (problems.length > 0) {
    throw new Error(
      `Routes in app/ don't match links in site.config.ts:\n${problems.map((p) => `  - ${p}`).join("\n")}`
    );
  }
}
