"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";

export type NavLink = { label: string; href: string };

export default function Navbar({
  title,
  shortTitle,
  links,
  brand,
  prodApex,
}: {
  title: string;
  shortTitle?: string;
  links: NavLink[];
  brand?: React.ReactNode;
  prodApex: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-accent/30 bg-accent/10">
      <div className="px-6 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-x-6 gap-y-2">
        {/* Left: brand (optional) + title — pinned to column 1. When shortTitle is given, the
            full title shows on mobile (where links are hidden, so there's no space pressure) and
            at lg+ (where there's room again), swapping to the abbreviated form only in the
            narrower md-to-lg band where it's competing with the centered links for space. */}
        <Link href="/" className="col-start-1 flex items-center gap-2 font-semibold text-lg tracking-tight shrink-0">
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

        {/* Links — centered in column 2 (the 1fr track), so this stays truly centered between
            title and controls no matter their width, without overlapping either (unlike absolute
            positioning). Wraps to a second line only if it doesn't fit, growing the header instead
            of overlapping. Pinned to column 2 via col-start so it doesn't shift into column 3 when
            hidden below md (grid auto-placement would otherwise slide the controls div into the
            gap it leaves behind). */}
        <ul className="col-start-2 hidden md:flex flex-wrap justify-center gap-x-6 gap-y-1 text-base">
          {links.map(({ label, href }) => (
            <li key={href}>
              <NavItem href={href} label={label} />
            </li>
          ))}
        </ul>

        {/* Right: theme toggle + (when applicable) mobile hamburger — pinned to column 3 */}
        <div className="col-start-3 flex items-center gap-2">
          <ThemeToggle prodApex={prodApex} />
          <button
            className="md:hidden flex flex-col gap-1.5 p-1"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            <HamburgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? "max-h-80" : "max-h-0"}`}>
        <ul className="px-4 pb-4 flex flex-col gap-3 text-sm">
          {links.map(({ label, href }) => (
            <li key={href}>
              <NavItem href={href} label={label} onClick={() => setOpen(false)} />
            </li>
          ))}
        </ul>
      </div>
    </header>
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
