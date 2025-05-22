// Constants for theme management
const THEME_DARK = "dark";
const THEME_LIGHT = "light";

/**
 * Initialize theme toggle functionality
 */
export function initThemeToggle() {
  const sunnyIcons = document.getElementsByName("sunny");
  const moonIcons = document.getElementsByName("moon");
  const themeSwitches = document.getElementsByClassName("theme-switch");

  // Get saved theme or use dark as default
  let theme = localStorage.getItem("theme") || THEME_DARK;

  // Load and setup SVG pattern
  setupSvgPattern();

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
 * Load and prepare the SVG pattern
 */
function setupSvgPattern() {
  fetch("/path/to/pattern.svg")
    .then((response) => response.text())
    .then((svgText) => {
      // Create a Blob from the SVG text
      const blob = new Blob([svgText], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // Set initial background image
      document.body.style.backgroundImage = `url(${url})`;
    })
    .catch((error) => {
      console.error("Error loading SVG pattern:", error);
    });
}

/**
 * Apply the selected theme to the document
 * @param {string} theme - Theme name ('dark' or 'light')
 * @param {HTMLCollection} sunnyIcons - Collection of sunny icons
 * @param {HTMLCollection} moonIcons - Collection of moon icons
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

  // Update SVG fill color dynamically
  updateSvgFill(theme === THEME_DARK ? "#fff" : "#000");

  // Set theme attribute and save to localStorage
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
}

/**
 * Update the SVG fill color
 * @param {string} fillColor - Color to use for the SVG fill
 */
function updateSvgFill(fillColor) {
  fetch("../../imgs/background.svg")
    .then((response) => response.text())
    .then((svgText) => {
      // Update the fill color in the SVG
      const updatedSvg = svgText.replace(
        /<path fill="(#[0-9a-fA-F]{3,8})"/g,
        `<path fill="${fillColor}"`
      );

      // Create a Blob from the modified SVG
      const blob = new Blob([updatedSvg], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      // Update the background image
      document.body.style.backgroundImage = `url(${url})`;
    })
    .catch((error) => {
      console.error("Error updating SVG pattern:", error);
    });
}
