window.onload = function () {
  // Dark/Light Theme Logic
  const sunnyIcons = document.getElementsByName("sunny");
  const moonIcons = document.getElementsByName("moon");
  const themeSwitches = document.getElementsByClassName("switch");

  let theme = localStorage.theme || "dark";
  document.documentElement.setAttribute("data-theme", theme);

  if (theme === "light") {
    for (let i = 0; i < sunnyIcons.length; i++) {
      sunnyIcons[i].style.display = "none";
      moonIcons[i].style.display = "inline-block";
    }
  }

  for (let i = 0; i < themeSwitches.length; i++) {
    themeSwitches[i].addEventListener("click", function () {
      if (theme === "dark") {
        for (let j = 0; j < moonIcons.length; j++) {
          sunnyIcons[j].style.display = "none";
          moonIcons[j].style.display = "inline-block";
        }
        theme = "light";
      } else {
        for (let j = 0; j < sunnyIcons.length; j++) {
          sunnyIcons[j].style.display = "inline-block";
          moonIcons[j].style.display = "none";
        }
        theme = "dark";
      }
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.theme = theme;
    });
  }

  // Mobile Navigation
  const mobileLinks = document.getElementById("mobileNav__links");
  const menuIcon = document.getElementById("mobileNav__icon");
  const menuClose = document.getElementsByClassName("mobileNav__close")[0];

  menuIcon.addEventListener("click", toggleMenu);
  menuClose.addEventListener("click", closeMenu);
  mobileLinks.addEventListener("click", closeMenu);

  function toggleMenu() {
    if (menuIcon.getAttribute("name") === "close-sharp") {
      closeMenu();
    } else {
      menuIcon.setAttribute("name", "close-sharp");
      mobileLinks.style.height = "fit-content";
    }
  }

  function closeMenu() {
    mobileLinks.style.height = "0rem";
    menuIcon.setAttribute("name", "menu-sharp");
  }

  // TypeWriter
  const content = ["create.", "design.", "develop."];
  let contentIndex = 0;
  let characterIndex = 0;
  let intervalValue;
  const textElement = document.querySelector("#dynamicText");
  const cursor = document.querySelector("#cursor");

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

  intervalValue = setInterval(typeText, 100);

  // Navigation Links
  const navLinks = document.querySelectorAll(".nav__link");

  const changeLinkBackground = (link) => {
    navLinks.forEach((navLink) => {
      navLink.style.color = "";
      navLink.style.backgroundColor = "";
    });
    link.style.color = "var(--hover-font-color)";
    link.style.backgroundColor = "var(--hover-color)";
  };

  navLinks.forEach((navLink) => {
    navLink.addEventListener("click", (e) => {
      e.preventDefault();
      const sectionId = navLink.getAttribute("href");
      const section = document.querySelector(sectionId);
      section.scrollIntoView({ behavior: "smooth" });
      changeLinkBackground(navLink);
    });
  });

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
