import { getTheme, initializeTheme, toggleTheme } from "../state/theme.js";

const themeToggleButton = document.getElementById("theme-toggle");

export function initializeThemeControls() {
  initializeTheme();
  syncThemeControls();
  themeToggleButton.addEventListener("click", handleThemeToggle);
}

export function syncThemeControls() {
  const activeTheme = getTheme();
  const nextThemeLabel = activeTheme === "dark" ? "Light Mode" : "Dark Mode";

  themeToggleButton.setAttribute("aria-label", `Switch to ${nextThemeLabel.toLowerCase()}`);
  themeToggleButton.setAttribute("aria-pressed", String(activeTheme === "light"));
  themeToggleButton.dataset.theme = activeTheme;
}

function handleThemeToggle() {
  toggleTheme();
  syncThemeControls();
}
