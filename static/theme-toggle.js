(() => {
  const STORAGE_KEY = "leaderboard-theme";

  function isDark() {
    return document.documentElement.classList.contains("dark-theme");
  }

  function applyTheme(mode) {
    const root = document.documentElement;
    if (mode === "dark") root.classList.add("dark-theme");
    else root.classList.remove("dark-theme");
    document.dispatchEvent(new CustomEvent("themechange", { detail: { mode } }));
  }

  function readPreference() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch (e) {}
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  function persist(mode) {
    try { localStorage.setItem(STORAGE_KEY, mode); } catch (e) {}
  }

  function wireToggleButtons() {
    const buttons = document.querySelectorAll(".theme-toggle");
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = isDark() ? "light" : "dark";
        applyTheme(next);
        persist(next);
        btn.setAttribute("aria-pressed", String(next === "dark"));
      });
      btn.setAttribute("aria-pressed", String(isDark()));
    });
  }

  // Apply preference as early as possible. The pre-paint snippet inlined in
  // <head> handles this before first paint to avoid FOUC; this is the
  // post-load safety net that also wires up the toggle button.
  applyTheme(readPreference());

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireToggleButtons);
  } else {
    wireToggleButtons();
  }

  // Sync with system preference if the user has not made an explicit choice.
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", (e) => {
    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch (err) {}
    if (saved !== "dark" && saved !== "light") {
      applyTheme(e.matches ? "dark" : "light");
    }
  });
})();
