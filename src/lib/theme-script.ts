export const THEME_STORAGE_KEY = "estateflow.theme";

/** Runs before paint so the first frame matches the saved theme. */
export const THEME_BOOTSTRAP_SCRIPT = `(() => {
  try {
    const stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    const dark =
      stored === "dark" ||
      (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch {}
})();`;
