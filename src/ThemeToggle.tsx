"use client";

import { useEffect, useSyncExternalStore } from "react";
import { Moon, Sun, SunMoon } from "lucide-react";
import { getTheme, setTheme, type Theme } from "./theme";

const cycle: Theme[] = ["auto", "light", "dark"];

const icons: Record<Theme, React.ReactNode> = {
  auto: <SunMoon size={18} aria-hidden />,
  light: <Sun size={18} aria-hidden />,
  dark: <Moon size={18} aria-hidden />,
};

const THEME_EVENT = "theme-change";
const THEME_CHANNEL = "theme";

// We use a BroadcastChannel to communicate theme changes across tabs.
const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(THEME_CHANNEL) : null;

function subscribe(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback); // monitor custom event for theme changes within the same tab
  channel?.addEventListener("message", callback); // monitor other tabs on the same origin
  return () => {
    window.removeEventListener(THEME_EVENT, callback);
    channel?.removeEventListener("message", callback);
  };
}

function resolveDataTheme(theme: Theme): "dark" | "light" {
  if (theme !== "auto") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export default function ThemeToggle({ prodApex }: { prodApex: string }) {
  const getServerSnapshot = (): Theme => "auto"; // During SSR, we don't read the request's cookies here, so we return a default value
  const theme = useSyncExternalStore<Theme>(subscribe, getTheme, getServerSnapshot);

  function applyTheme(theme: Theme) {
    setTheme(theme, prodApex);
    window.dispatchEvent(new Event(THEME_EVENT));
    channel?.postMessage(theme);
  }

  // Update the data-theme attribute on the document element whenever the theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolveDataTheme(theme));
  }, [theme]);

  // If the theme is set to "auto", we also need to listen for changes in the user's system preference
  useEffect(() => {
    if (theme !== "auto") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", resolveDataTheme("auto"));
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function toggle() {
    applyTheme(cycle[(cycle.indexOf(theme) + 1) % cycle.length]);
  }

  return (
    <button
      onClick={toggle}
      aria-label={`Theme: ${theme} — click to cycle`}
      title={`Theme: ${theme}`}
      className="opacity-60 hover:opacity-100 transition-opacity p-1 w-9 h-9 flex items-center justify-center"
    >
      {icons[theme]}
    </button>
  );
}
