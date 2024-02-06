window.onload = function () {
  // Dark/Light Theme Logic
  const sunnyIcons = document.getElementsByName("sunny");
  const moonIcons = document.getElementsByName("moon");
  const themeSwitches = document.getElementsByClassName("switch");
  const body = document.body;

  // Use a constant for the theme name to avoid magic strings
  const THEME_DARK = "dark";
  const THEME_LIGHT = "light";
  let theme = localStorage.theme || THEME_DARK;

  // Function to toggle theme
  function toggleTheme() {
    if (theme === THEME_DARK) {
      for (let i = 0; i < sunnyIcons.length; i++) {
        sunnyIcons[i].style.display = "none";
        moonIcons[i].style.display = "inline-block";
      }
      theme = THEME_LIGHT;
      let currentUrl = getComputedStyle(body).backgroundImage;
      let newUrl = currentUrl.replace("fill='%23fff'", "fill='%23000'");
      body.style.backgroundImage = newUrl;
      console.log(currentUrl);
    } else {
      for (let i = 0; i < sunnyIcons.length; i++) {
        sunnyIcons[i].style.display = "inline-block";
        moonIcons[i].style.display = "none";
      }
      theme = THEME_DARK;
      let currentUrl = getComputedStyle(body).backgroundImage;
      let newUrl = currentUrl.replace("fill='%23000'", "fill='%23fff'");
      body.style.backgroundImage = newUrl;
    }
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.theme = theme;
  }

  // Apply the initial theme
  document.documentElement.setAttribute("data-theme", theme);

  // Attach click event listener to theme switches
  for (let i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener("click", toggleTheme);
  }

  // Mobile Navigation
  const mobileLinks = document.getElementById("mobileNav__links");
  const menuIcon = document.getElementById("mobileNav__icon");
  const menuClose = document.getElementsByClassName("mobileNav__close")[0];

  // Function to toggle mobile menu
  function toggleMenu() {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      closeMenu();
    } else {
      menuIcon.setAttribute("name", "close-sharp");
      mobileLinks.style.height = "fit-content";
    }
  }

  // Function to close mobile menu
  function closeMenu() {
    mobileLinks.style.height = "0rem";
    menuIcon.setAttribute("name", "menu-sharp");
  }

  // Attach click event listeners for mobile navigation
  menuIcon.addEventListener("click", toggleMenu);
  menuClose.addEventListener("click", closeMenu);
  mobileLinks.addEventListener("click", closeMenu);

  // TypeWriter
  const content = ["create.", "design.", "develop.", "innovate."];
  let contentIndex = 0;
  let characterIndex = 0;
  let intervalValue;
  const textElement = document.querySelector("#dynamicText");
  const cursor = document.querySelector("#cursor");

  // Function to type text
  function typeText() {
    cursor.style.animation = null;
    let text = content[contentIndex].substring(0, characterIndex + 1);
    textElement.innerText = text;
    characterIndex++;

    if (text === content[contentIndex]) {
      cursor.style.animation = "blink 1s step-end infinite";
      clearInterval(intervalValue);
      setTimeout(function () {
        intervalValue = setInterval(deleteText, 50);
      }, 2000);
    }
  }

  // Function to delete text
  function deleteText() {
    cursor.style.animation = null;
    let text = content[contentIndex].substring(0, characterIndex - 1);
    textElement.innerHTML = text;
    characterIndex--;

    if (text === "") {
      clearInterval(intervalValue);
      if (contentIndex == content.length - 1) contentIndex = 0;
      else contentIndex++;
      characterIndex = 0;

      setTimeout(function () {
        cursor.style.display = "inline-block";
        intervalValue = setInterval(typeText, 100);
      }, 200);
    }
  }

  // Initialize the typeText function
  intervalValue = setInterval(typeText, 100);

  // Navigation Links
  const navLinks = document.querySelectorAll(".nav__link");

  // Function to change link background
  function changeLinkBackground(link) {
    navLinks.forEach((navLink) => {
      navLink.style.color = "";
      navLink.style.backgroundColor = "";
    });
    link.style.color = "var(--hover-font-color)";
    link.style.backgroundColor = "var(--hover-color)";
  }

  // Attach click event listeners to navigation links
  navLinks.forEach((navLink) => {
    navLink.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = navLink.getAttribute("href");
      const section = document.querySelector(sectionId);
      section.scrollIntoView({ behavior: "smooth" });
      changeLinkBackground(navLink);
    });
  });

  // Detect scroll and highlight active link
  document.addEventListener("scroll", () => {
    if (window.scrollY < 600) {
      navLinks.forEach((navLink) => {
        navLink.style.color = "";
        navLink.style.backgroundColor = "";
      });
    } else {
      navLinks.forEach((navLink) => {
        const sectionId = navLink.getAttribute("href");
        const section = document.querySelector(sectionId);
        const bounding = section.getBoundingClientRect();
        const middle = (bounding.bottom - bounding.top) / 2;
        if (
          bounding.top + middle >= 0 &&
          bounding.left >= 0 &&
          bounding.right <= window.innerWidth &&
          bounding.bottom - middle <= window.innerHeight
        ) {
          changeLinkBackground(navLink);
        }
      });
    }
  });
};
