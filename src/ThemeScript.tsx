// To prevent flash of incorrect theme on initial load, set data-theme attribute before React hydration.
// This is a raw string, not a module — it runs before any bundled JS loads, so it can't import
// the "theme" cookie name from theme.ts; that name is duplicated here as a literal on purpose.
const themeScript = `
(function () {
  try {
    var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    var t = m ? decodeURIComponent(m[1]) : null;
    if (t !== 'light' && t !== 'dark') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    document.documentElement.setAttribute('data-theme', t);
  } catch (e) {}
})();
`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
