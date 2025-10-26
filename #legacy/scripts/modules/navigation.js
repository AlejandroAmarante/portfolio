/**
 * Initialize navigation links functionality
 */
export function initNavigation() {
  const navLinks = document.querySelectorAll(".nav__link");

  if (!navLinks.length) {
    console.warn("Navigation links not found");
    return;
  }

  // Add click event listeners to all navigation links
  navLinks.forEach((navLink) => {
    navLink.addEventListener("click", (event) => {
      event.preventDefault();

      const sectionId = navLink.getAttribute("href");
      const section = document.querySelector(sectionId);

      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
        highlightActiveLink(navLink, navLinks);
      }
    });
  });

  // Set up scroll event to highlight active section in navigation
  setupScrollHighlighting(navLinks);
}

/**
 * Set up scroll event listener to highlight active section
 * @param {NodeList} navLinks - Collection of navigation links
 */
function setupScrollHighlighting(navLinks) {
  // Use throttling to improve scroll performance
  let isScrolling = false;

  document.addEventListener("scroll", () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        updateActiveLink(navLinks);
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
}

/**
 * Update active link based on current scroll position
 * @param {NodeList} navLinks - Collection of navigation links
 */
function updateActiveLink(navLinks) {
  // If at the top of the page, clear all highlights
  if (window.scrollY < 600) {
    clearLinkHighlights(navLinks);
    return;
  }

  // Find the section currently in viewport
  navLinks.forEach((navLink) => {
    const sectionId = navLink.getAttribute("href");
    const section = document.querySelector(sectionId);

    if (section) {
      const rect = section.getBoundingClientRect();
      const middle = (rect.bottom - rect.top) / 2;

      // Check if section is in viewport
      if (
        rect.top + middle >= 0 &&
        rect.left >= 0 &&
        rect.right <= window.innerWidth &&
        rect.bottom - middle <= window.innerHeight
      ) {
        highlightActiveLink(navLink, navLinks);
      }
    }
  });
}

/**
 * Highlight the active navigation link
 * @param {HTMLElement} activeLink - The link to highlight
 * @param {NodeList} allLinks - All navigation links
 */
function highlightActiveLink(activeLink, allLinks) {
  clearLinkHighlights(allLinks);

  activeLink.classList.add("nav__link--active");
}

/**
 * Clear highlighting from all navigation links
 * @param {NodeList} links - Collection of navigation links
 */
function clearLinkHighlights(links) {
  links.forEach((link) => {
    link.classList.remove("nav__link--active");
  });
}
