const THEME_STORAGE_KEY = "jaycee-theme";
const THEMES = {
  dark: {
    id: "dark",
    cssTheme: "dark",
    background: [20, 20, 20],
    maskBackground: 20,
    accent: [100, 180, 255],
    accentSoft: [100, 180, 220],
    accentBright: [130, 210, 255],
    text: [200, 220, 255],
    textStrong: [245, 248, 255],
    sun: [255, 95, 95]
  },
  light: {
    id: "light",
    cssTheme: "light",
    background: [245, 242, 234],
    maskBackground: 245,
    accent: [78, 121, 168],
    accentSoft: [86, 126, 168],
    accentBright: [111, 150, 196],
    text: [58, 78, 108],
    textStrong: [32, 46, 66],
    sun: [210, 102, 79]
  }
};

let currentTheme = "dark";

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function resolveStoredTheme() {
  if (!canUseLocalStorage()) {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme && THEMES[storedTheme] ? storedTheme : null;
}

export function initializeTheme() {
  currentTheme = resolveStoredTheme() ?? currentTheme;
  applyThemeToDocument();
}

export function getTheme() {
  return currentTheme;
}

export function getCanvasTheme() {
  return THEMES[currentTheme];
}

export function setTheme(theme) {
  if (!THEMES[theme]) {
    return false;
  }

  currentTheme = theme;
  applyThemeToDocument();

  if (canUseLocalStorage()) {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  return true;
}

export function toggleTheme() {
  return setTheme(currentTheme === "dark" ? "light" : "dark");
}

function applyThemeToDocument() {
  document.body.dataset.theme = THEMES[currentTheme].cssTheme;
}
