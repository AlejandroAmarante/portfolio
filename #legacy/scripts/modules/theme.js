// Constants for theme management
const THEME_DARK = "dark";
const THEME_LIGHT = "light";

/**
 * Gets the full URL to the background SVG
 */
function getBackgroundSvgUrl() {
  // Get the base URL (e.g., "https://alejandroamarante.github.io/portfolio/")
  const baseUrl =
    window.location.href.split("/").slice(0, 3).join("/") +
    window.location.pathname.split("/").slice(0, 2).join("/");

  // Construct full URL to the SVG
  return `${baseUrl}/imgs/background.svg`;
}

/**
 * Initialize theme toggle functionality
 */
export function initThemeToggle() {
  const sunnyIcons = document.getElementsByName("sunny");
  const moonIcons = document.getElementsByName("moon");
  const themeSwitches = document.getElementsByClassName("theme-switch");

  // Get saved theme or use dark as default
  let theme = localStorage.getItem("theme") || THEME_DARK;

  // Apply the initial theme
  applyTheme(theme, sunnyIcons, moonIcons);

  // Attach click event listeners to theme switches
  Array.from(themeSwitches).forEach((switchEl) => {
    switchEl.addEventListener("click", () => {
      theme = theme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
      applyTheme(theme, sunnyIcons, moonIcons);
    });
  });
}

/**
 * Apply the selected theme to the document
 */
function applyTheme(theme, sunnyIcons, moonIcons) {
  // Update icons visibility
  const showSunny = theme === THEME_DARK;
  Array.from(sunnyIcons).forEach((icon) => {
    icon.style.display = showSunny ? "inline-block" : "none";
  });
  Array.from(moonIcons).forEach((icon) => {
    icon.style.display = showSunny ? "none" : "inline-block";
  });

  // Update SVG fill color
  updateSvgFill(theme === THEME_DARK ? "#fff" : "#000");

  // Set theme attribute and save to localStorage
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

/**
 * Update the SVG fill color
 */
function updateSvgFill(fillColor) {
  const svgUrl = getBackgroundSvgUrl();

  fetch(svgUrl)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.status}`);
      }
      return response.text();
    })
    .then((svgText) => {
      // Update the fill color in the SVG
      const updatedSvg = svgText.replace(
        /<path fill="(#[0-9a-fA-F]{3,8})"/g,
        `<path fill="${fillColor}"`
      );

      // Create data URL instead of Blob for better compatibility
      const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
        updatedSvg
      )}`;
      document.body.style.backgroundImage = `url("${svgDataUrl}")`;
    })
    .catch((error) => {
      console.error("Error updating SVG pattern:", error);
      // Fallback to CSS background
      document.body.style.backgroundImage =
        theme === THEME_DARK
          ? "linear-gradient(to right, #333, #333)"
          : "linear-gradient(to right, #fff, #fff)";
    });
}
