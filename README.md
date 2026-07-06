# static-site-kit

Shared `Navbar`, `ThemeToggle`, theme/cookie persistence, and typography/layout primitives (`PageShell`, `SectionHeader`, `EventCard`, etc.) for a family of small static Next.js event sites.

This package ships raw, unbuilt TypeScript/TSX source — there's no build step and no `dist/`. Consuming sites compile it themselves via Next.js's [`transpilePackages`](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages), the same way they compile their own local code.

## Exports

Everything is re-exported from the package root (`import { ... } from "static-site-kit"`):

- **`Navbar`** — `{ title: string; shortTitle?: string; links: NavLink[]; brand?: React.ReactNode; prodApex: string }`. Renders the header, mobile drawer, and `ThemeToggle`. If `shortTitle` is given, the header shows the full `title` on mobile (where links are hidden) and at `lg`+ (where there's room again), swapping to `shortTitle` only in the narrower `md`-to-`lg` band where the title is competing with the centered links for space.
- **`NavLink`** — type: `{ label: string; href: string }`.
- **`ThemeToggle`** — `{ prodApex: string }`. Usually rendered internally by `Navbar`, but exported standalone too.
- **`getTheme()`** / **`setTheme(theme, apex)`** / **`Theme`** — the underlying cookie-backed theme persistence. `apex` scopes the cookie's `Domain` attribute (e.g. `"yoursite.info"`) so the theme choice is shared with a registration app or other subdomain on the same parent domain; it's only applied when the page is actually being served from that domain (so `localhost`/preview URLs are unaffected).
- **`getCookie`** / **`setCookie`** / **`deleteCookie`** — generic, app-agnostic cookie helpers `theme.ts` is built on.
- **`PageShell`, `SectionHeader`, `SectionSubHeader`, `Paragraph`, `BulletList`, `Callout`, `Blockquote`, `SectionDivider`, `EventCard`, `InlineLink`** — typography/layout primitives (from `ui.tsx`).

## Using this in a site

1. Add the dependency, pointing at a released tag:
   ```json
   "static-site-kit": "github:ashgoren/static-site-kit#v0.1.0"
   ```
2. Add it to `transpilePackages` in `next.config.ts`:
   ```ts
   const nextConfig: NextConfig = {
     transpilePackages: ["static-site-kit"],
   };
   ```
3. Make sure `react`, `next`, and `lucide-react` are installed in the consuming site (they're `peerDependencies`, not bundled).
4. If the site uses Tailwind v4 (`@import "tailwindcss"` in `globals.css`): Tailwind excludes `node_modules` from its default content scan, so it won't generate CSS for classes used only inside this package unless told to look there. Add this to `globals.css`:
   ```css
   @source "../node_modules/static-site-kit/src";
   ```
   (adjust the relative path if `globals.css` doesn't live one level under the project root). Without this, `Navbar`/`ui.tsx` components render with no styling at all — structure intact, but no borders, spacing, or responsive `hidden`/`flex` behavior, since those utility classes never get generated.
5. Use it:
   ```tsx
   // app/layout.tsx
   import { Navbar, type NavLink } from "static-site-kit";

   const links: NavLink[] = [
     { label: "Home", href: "/" },
     { label: "Contact", href: "/contact" },
   ];

   <Navbar title="Your Site Name" links={links} prodApex="yoursite.info" />
   ```
   ```tsx
   // app/some-page/page.tsx
   import { PageShell, Paragraph, InlineLink } from "static-site-kit";
   ```

## Local development (co-developing with a consuming site)

Turbopack (Next.js's default bundler) does not follow symlinks when resolving `transpilePackages`-listed modules — this is a Turbopack limitation, confirmed by testing. A real, git-tag-installed copy (the resting state above) works fine under Turbopack with no special flags. The gap only shows up while iterating on this repo locally against a sibling checkout via a `file:` dependency, since npm installs `file:` deps as symlinks.

To make changes here and preview them live in a consuming site before cutting a release:

1. In the consuming site's `package.json`, temporarily point at the local checkout:
   ```json
   "static-site-kit": "file:../static-site-kit"
   ```
   then `npm install` (this creates a symlink into that site's `node_modules`).
2. While that symlink is in place, run the consuming site with the `--webpack` flag instead of the Turbopack default, since webpack follows symlinks correctly:
   ```bash
   next dev --webpack
   next build --webpack
   ```
3. Once you're happy with the change, release it (see below), then switch the consuming site back to the git-tag dependency and `npm install` — this removes the symlink and restores normal Turbopack `dev`/`build` with no flags needed.

## Releasing a new version

```bash
git add -A
git commit -m "..."
git push
git tag v0.2.0
git push origin v0.2.0
```

Also bump `"version"` in `package.json` to match (e.g. `"0.2.0"`) — good hygiene for anyone reading the file, and would matter if this were ever published to a real npm registry. It's not load-bearing today, though: consuming sites depend on an exact git tag (`#v0.2.0`), so npm resolves the dependency by checking out that git ref directly and never looks at this package's internal `"version"` field. You could tag `v0.5.0` while `package.json` still said `"0.1.0"` and installs would work fine — don't rely on that, but know it won't break anything if the two ever drift.

**Tagging alone doesn't update anyone.** It only makes a new version available to install — nothing happens automatically for sites already depending on an older tag. For each consuming site that wants the update, you still have to go bump the ref in *that site's* `package.json` (e.g. `#v0.1.0` → `#v0.2.0`) and run `npm install` there to regenerate its lockfile entry. This two-step (tag here, then bump-and-install there) is deliberate — it's what makes installs pinned and non-drifting rather than silently picking up changes.
