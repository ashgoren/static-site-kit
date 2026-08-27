"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export type NavLink = { label: string; href: string };

export default function Navbar({
  prodApex,
  links,
  title,
  shortTitle,
  brand,
  headerImage,
  centerLinksOnPage = false,
  tinted = true,
}: {
  prodApex: string;
  links: NavLink[];
  title: string;
  shortTitle?: string;
  brand?: React.ReactNode;
  headerImage?: React.ReactNode; // optional full-width header image (renders above links and replaces title & brand)
  centerLinksOnPage?: boolean; // center links to page width rather than between title and controls (default false)
  tinted?: boolean; // tint header bg with accent color (default true)
}) {
  const [open, setOpen] = useState(false);

  const hamburgerButton = links.length > 0 && (
    <button
      className="col-start-1 md:hidden w-9 flex flex-col items-center gap-1.5 p-1"
      onClick={() => setOpen((o) => !o)}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
    >
      <HamburgerIcon open={open} />
    </button>
  );

  return (
    <header className={`border-b border-accent/30 ${tinted ? "bg-accent/10" : "bg-background"}`}>
      {headerImage ? (
        <>
          <div className="flex items-start justify-between gap-4 px-6 pt-4 pb-4 md:pb-0">
            {hamburgerButton}
            <div className="flex-1 flex justify-center">{headerImage}</div>
            <div className="-mt-[5px]">
              <ThemeToggle prodApex={prodApex} />
            </div>
          </div>
          <div className="relative px-6 md:py-3 grid grid-cols-[auto_1fr_auto] items-center">
            <LinksList links={links} centerLinksOnPage={centerLinksOnPage} />
          </div>
        </>
      ) : (
        <div className="relative px-6 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2">
          {hamburgerButton}

          {/* Left: brand (optional) + title. Column 1 (left-aligned) at md+, matching desktop's
              title/links/controls row. On mobile, moves to column 2 (the 1fr track) and centers
              itself there — between the hamburger (column 1) and theme toggle (column 3) —
              instead of sitting left-pinned next to the hamburger. When shortTitle is given, the
              full title shows on mobile (where links are hidden, so there's no space pressure)
              and at lg+ (where there's room again), swapping to the abbreviated form only in the
              narrower md-to-lg band where it's competing with the centered links for space. */}
          <Link href="/" className="col-start-2 md:col-start-1 flex items-center justify-center md:justify-start gap-2 font-semibold text-lg tracking-tight shrink-0">
            {brand}
            {shortTitle ? (
              <>
                <span className="md:hidden lg:inline">{title}</span>
                <span className="hidden md:inline lg:hidden">{shortTitle}</span>
              </>
            ) : (
              title
            )}
          </Link>

          <LinksList links={links} centerLinksOnPage={centerLinksOnPage} />

          <div className="col-start-3">
            <ThemeToggle prodApex={prodApex} />
          </div>
        </div>
      )}

      <MobileDrawer links={links} open={open} onNavigate={() => setOpen(false)} />
    </header>
  );
}

// Centered in column 2 (the 1fr track) by default, so it stays truly centered between title and
// controls no matter their width, without overlapping either (unlike absolute positioning).
// Wraps to a second line only if it doesn't fit, growing the header instead of overlapping.
// Pinned to column 2 via col-start so it doesn't shift into column 3 when hidden below md (grid
// auto-placement would otherwise slide the controls div into the gap it leaves behind).
//
// When centerLinksOnPage is set, links are absolutely centered on the full header width instead,
// so they land at the same x-position as page content centered below the header — at the cost of
// the overlap protection above, so this is meant for short link lists.
function LinksList({ links, centerLinksOnPage }: { links: NavLink[]; centerLinksOnPage: boolean }) {
  return (
    <ul
      className={
        centerLinksOnPage
          ? "absolute left-1/2 -translate-x-1/2 hidden md:flex flex-wrap justify-center gap-x-6 gap-y-1 text-base"
          : "col-start-2 hidden md:flex flex-wrap justify-center gap-x-6 gap-y-1 text-base"
      }
    >
      {links.map(({ label, href }) => (
        <li key={href}>
          <NavItem href={href} label={label} />
        </li>
      ))}
    </ul>
  );
}

function MobileDrawer({ links, open, onNavigate }: { links: NavLink[]; open: boolean; onNavigate: () => void }) {
  if (links.length === 0) return null;
  return (
    <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80" : "max-h-0"}`}>
      <ul className="px-4 pb-4 flex flex-col gap-3 text-sm">
        {links.map(({ label, href }) => (
          <li key={href}>
            <NavItem href={href} label={label} onClick={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function NavItem({ href, label, onClick }: { href: string; label: string; onClick?: () => void }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`transition-opacity hover:opacity-100 ${
        pathname === href ? "text-accent font-semibold" : "opacity-60"
      }`}
    >
      {label}
    </Link>
  );
}

function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <>
      <span className={`block h-0.5 w-5 bg-foreground transition-transform origin-center ${open ? "translate-y-2 rotate-45" : ""}`} />
      <span className={`block h-0.5 w-5 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
      <span className={`block h-0.5 w-5 bg-foreground transition-transform origin-center ${open ? "-translate-y-2 -rotate-45" : ""}`} />
    </>
  );
}
