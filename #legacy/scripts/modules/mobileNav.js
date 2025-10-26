/**
 * Initialize mobile navigation functionality
 */
export function initMobileNavigation() {
  const mobileLinks = document.getElementsByClassName("mobile-nav__links")[0];
  const menuIcon = document.getElementsByClassName("mobile-nav__icon")[0];
  const menuClose = document.getElementsByClassName("mobile-nav__close")[0];

  if (!mobileLinks || !menuIcon || !menuClose) {
    console.warn("Mobile navigation elements not found");
    return;
  }

  // Toggle menu on menu icon click
  menuIcon.addEventListener("click", () => {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      closeMenu(mobileLinks, menuIcon);
    } else {
      openMenu(mobileLinks, menuIcon);
    }
  });

  // Close menu on close button click
  menuClose.addEventListener("click", () => closeMenu(mobileLinks, menuIcon));

  // Close menu when clicking on any mobile link
  mobileLinks.addEventListener("click", () => closeMenu(mobileLinks, menuIcon));
}

/**
 * Open the mobile navigation menu
 * @param {HTMLElement} mobileLinks - The mobile links container
 * @param {HTMLElement} menuIcon - The menu icon element
 */
function openMenu(mobileLinks, menuIcon) {
  menuIcon.setAttribute("name", "close-sharp");
  mobileLinks.style.height = "fit-content";
}

/**
 * Close the mobile navigation menu
 * @param {HTMLElement} mobileLinks - The mobile links container
 * @param {HTMLElement} menuIcon - The menu icon element
 */
function closeMenu(mobileLinks, menuIcon) {
  mobileLinks.style.height = "0rem";
  menuIcon.setAttribute("name", "menu-sharp");
}
