// Main entry point for the application
import { initThemeToggle } from "./modules/theme.js";
import { initMobileNavigation } from "./modules/mobileNav.js";
import { initTypewriter } from "./modules/typewriter.js";
import { initNavigation } from "./modules/navigation.js";
import { initEmailClipboard } from "./modules/emailClipboard.js";
import { initProjectCards } from "./modules/projectCards.js";

// Initialize all modules when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initMobileNavigation();
  initTypewriter();
  initNavigation();
  initEmailClipboard();
  initProjectCards();
});
