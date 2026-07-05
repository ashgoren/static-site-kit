import { getCookie, setCookie, deleteCookie } from "./cookies";

export type Theme = "auto" | "light" | "dark";

const THEME_COOKIE = "theme";

function themeCookieDomain(apex: string): string | undefined {
  const { hostname } = window.location;
  const onProdDomain = hostname === apex || hostname.endsWith(`.${apex}`);
  return onProdDomain ? apex : undefined;
}

export function getTheme(): Theme {
  const stored = getCookie(THEME_COOKIE);
  return stored === "light" || stored === "dark" ? stored : "auto";
}

// `apex` scopes the cookie to that domain (and its subdomains), e.g. so a
// site's static pages and a registration app on a subdomain stay in sync.
export function setTheme(theme: Theme, apex: string): void {
  const domain = themeCookieDomain(apex);
  if (theme === "auto") {
    deleteCookie(THEME_COOKIE, { domain });
  } else {
    setCookie(THEME_COOKIE, theme, {
      maxAge: 31536000,
      sameSite: "Lax",
      domain,
      secure: window.location.protocol === "https:",
    });
  }
}
